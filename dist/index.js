"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_context_1 = require("./app_context/app_context");
const posts_1 = __importDefault(require("./routes/posts"));
const logUtils = __importStar(require("./utils/logging"));
const migrations_1 = require("./utils/migrations");
const post_analysis_1 = require("./worker/post_analysis");
const express_rate_limit_1 = require("express-rate-limit");
// Setup the context from config file
app_context_1.AppContext.initiateContext();
let pool = app_context_1.AppContext.getInstance().getPool();
pool.connect((error, client) => {
    if (error) {
        console.log("Error in connecting with PG db");
    }
    else {
        (0, migrations_1.migrateTables)(pool);
        createHttpServer();
        (0, post_analysis_1.SetupPostAnalysisWorker)(); // With use of command line can also be ran separately
    }
});
function createHttpServer() {
    const app = (0, express_1.default)();
    const port = 3000;
    // Ip based rate limiting [In memory currently. Use store option for other usages]
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        //store: external store such as redis can be used, right now only Memory store is being used.
    });
    app.use(express_1.default.json());
    app.use(limiter);
    // Health check path
    app.get("/ping", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.status(200).send();
    }));
    // Use the router for paths starting with '/api'
    app.use("/v1/external/posts", posts_1.default);
    app.listen(port, () => {
        logUtils.log(logUtils.LogLevels.Info, `Server is running on http://localhost:${port}`);
    });
}
