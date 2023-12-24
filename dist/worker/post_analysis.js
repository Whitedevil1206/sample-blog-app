"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupPostAnalysisWorker = void 0;
const app_context_1 = require("../app_context/app_context");
const cache_keys_1 = require("../constants/cache_keys");
const post_service_1 = require("../services/post_service");
const logging_1 = require("../utils/logging");
const PostAnalysisWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    const redis = app_context_1.AppContext.getInstance().getRedisClient();
    const pool = app_context_1.AppContext.getInstance().getPool();
    let postId = yield redis.lpop(cache_keys_1.PostAnalysisJobQueueKey);
    if (postId) {
        let result = yield pool.query("SELECT content,word_count,avg_word_length FROM posts WHERE id=$1", [postId]);
        let postContent = result.rows[0].content;
        let { totalWords, avgWordLength } = (0, post_service_1.analyzeString)(postContent);
        result = yield pool.query("UPDATE posts SET word_count = $1, avg_word_length = $2 WHERE id = $3;", [totalWords, avgWordLength, postId]);
        (0, logging_1.log)(logging_1.LogLevels.Info, "Post Analysis Worker Job Done", `id: ${postId}`);
    }
});
const SetupPostAnalysisWorker = () => {
    setInterval(() => {
        (0, logging_1.log)(logging_1.LogLevels.Info, "Post Analysis Worker Job Queue Check");
        PostAnalysisWorker();
    }, 10000);
};
exports.SetupPostAnalysisWorker = SetupPostAnalysisWorker;
