import express from "express";
import { Pool } from "pg";
import { AppContext } from "./app_context/app_context";
import postApiRouter from "./routes/posts";
import * as logUtils from "./utils/logging";
import { migrateTables } from "./utils/migrations";
import { SetupPostAnalysisWorker } from "./worker/post_analysis";

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

  app.use(express.json());
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
