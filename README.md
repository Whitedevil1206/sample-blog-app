# Basic Blog App Backend

## How to setup ?

_Requirements_: NodeJs >= 18.13.0, PostgresDB, Redis

1. `git clone` the project
2. Run `npm install`
3. Make sure to have running PostgresDb and Redis server locally or a publicly hosted link.
   Plese add the details of those in `config.yml` file.
4. Make sure to create the database beforehand entered in config file.
5. Run `npm start`
6. Application should start running at port `3000`

## Project Structure

- Entry Point: `src/index.ts`
- `app_context`: initializes and provides access to required clients.
- `routes`: registers various API routes
- `handlers`: handles, validates the incoming requests and sends appropriate responses.
- `services`: holds the business logic for the implementation. Db calls are also there currently which can be abstracted to `repo` layer.
- `utils`: contains some utility functions.
- `worker`: containes worker jobs which runs frequently (like cron) to execution some functions.
- `dist`: contains js output by ts compiler.

## API Routes

### Create Post

```
curl --location 'http://localhost:3000/v1/external/posts/123gf1' \
--header 'Content-Type: application/json' \
--data '{
    "id": "123gf1",
    "content": "Lorem ipsum.somekjf jkdsfh sjdhv jsdh bvkjs.",
    "title": "New Post 13"
}'
```

- Requires unique id, content and title

### Fetch All Posts

```
curl --location 'http://localhost:3000/v1/external/posts/'
```

### Fetch a Post

```
curl --location 'http://localhost:3000/v1/external/posts/123gf1'
```

Response

```
[200]
{
    "id": "123gf1",
    "content": "Lorem ipsum.somekjf jkdsfh sjdhv jsdh bvkjs.",
    "title": "New Post 13"
}
```

### Get Post Analysis

```
curl --location 'http://localhost:3000/v1/external/posts/123gf1/analysis'
```

Response

```
[200]
{
    "id": "123gf1",
    "total_words": "6",
    "avg_word_length": 6.5
}
```

## Features

1. Uses redis queues to schedule post analysis jobs and execute them.
2. Caching for improved response times
3. Basic Ip based rate limiting.

## Scalability Considerations

1. To handle large volumes of requests we can use a combination of vertical(maybe using Nginx, spinning up multiple processes in a instance) & horizontal scaling using docker(ECS,EC2,Lambda). Or can use serverless deploymemts like AWS Lambda.

2. Since analysis computation is a heavy task in the current basic implementation we are using Redis queues but for scale we can use AWS ECS/EC2, pub-sub systems,AWS Lambda triggered by AWS SQS to perform analysis in background and not in servers.

## Infrastructure Considerations

1. Database can be self hosted in cloud instances or abstracted to cloud providers such as AWS RDS.
2. Managing traffic spikes will depend on deployment method. Prefer to use ECS as it can scale up or down instances relatively quickly. Alternatively can also use serverless functions.
3. Using multiple instances will provide with high availability and fault tolerance at price of some read consistency.
4. There are various aspects in security measures, will depend on how the whole system is deployed. Important to consider npm post-install vulnerability,SQL injection, etc.
5. Logging, monitioring and alerting can be managed by cloud providers or we can use our own services such as prometheus or grafana for monitoring.
