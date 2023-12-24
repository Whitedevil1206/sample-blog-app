FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 3000

# Fetch config.yml from desired source

# Define the command to run your application
CMD ["npm", "start"]