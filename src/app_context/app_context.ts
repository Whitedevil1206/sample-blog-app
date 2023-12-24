import { Pool, PoolConfig } from "pg";
import yaml from "js-yaml";
import fs from "fs";
import Redis from "ioredis";
import { log, LogLevels } from "../utils/logging";

interface AppConfig {
  db: PoolConfig;
  redis: RedisConfig;
}

interface RedisConfig {
  host: string;
  port: number;
}

export class AppContext {
  private static instance: AppContext;
  private pool: Pool;
  private redis: Redis;

  private constructor() {
    const config = <AppConfig>(
      yaml.load(fs.readFileSync("./config.yml", "utf8"))
    );
    log(LogLevels.Info, "AppConfig received: ", config);
    this.pool = new Pool(config.db);

    // Create Redis client
    this.redis = new Redis(config.redis.port, config.redis.host);
  }

  public static initiateContext() {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }
    return;
  }

  public static getInstance(): AppContext {
    return this.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public getRedisClient(): Redis {
    return this.redis;
  }
}
