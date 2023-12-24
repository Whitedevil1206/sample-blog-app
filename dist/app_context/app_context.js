"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContext = void 0;
const pg_1 = require("pg");
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const ioredis_1 = __importDefault(require("ioredis"));
const logging_1 = require("../utils/logging");
class AppContext {
    constructor() {
        const config = (js_yaml_1.default.load(fs_1.default.readFileSync("./config.yml", "utf8")));
        (0, logging_1.log)(logging_1.LogLevels.Info, "AppConfig received: ", config);
        this.pool = new pg_1.Pool(config.db);
        // Create Redis client
        this.redis = new ioredis_1.default(config.redis.port, config.redis.host);
    }
    static initiateContext() {
        if (!AppContext.instance) {
            AppContext.instance = new AppContext();
        }
        return;
    }
    static getInstance() {
        return this.instance;
    }
    getPool() {
        return this.pool;
    }
    getRedisClient() {
        return this.redis;
    }
}
exports.AppContext = AppContext;
