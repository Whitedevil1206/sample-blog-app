import express from "express";
import { Pool } from "pg";
import { AppContext } from "./app_context/app_context";
import postApiRouter from "./routes/posts";
import * as logUtils from "./utils/logging";
import { migrateTables } from "./utils/migrations";
import { SetupPostAnalysisWorker } from "./worker/post_analysis";
import { rateLimit } from "express-rate-limit";

// Setup the context from config file
AppContext.initiateContext();
let pool: Pool = AppContext.getInstance().getPool();
pool.connect((error, client) => {
  if (error) {
    console.log("Error in connecting with PG db");
  } else {
    migrateTables(pool);
    createHttpServer();
    SetupPostAnalysisWorker(); // With use of command line can also be ran separately
  }
});

function createHttpServer() {
  const app = express();
  const port = 3000;

  // Ip based rate limiting [In memory currently. Use store option for other usages]
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    //store: external store such as redis can be used, right now only Memory store is being used.
  });

  app.use(express.json());
  app.use(limiter);
  // Health check path
  app.get("/ping", async (req: express.Request, res: express.Response) => {
    res.status(200).send();
  });

  // Use the router for paths starting with '/api'
  app.use("/v1/external/posts", postApiRouter);

  app.listen(port, () => {
    logUtils.log(
      logUtils.LogLevels.Info,
      `Server is running on http://localhost:${port}`
    );
  });
}
