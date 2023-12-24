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
exports.analyzeString = exports.fetchPostAnalysis = exports.fetchAllPosts = exports.fetchPost = exports.createPost = void 0;
const app_context_1 = require("../app_context/app_context");
const cache_keys_1 = require("../constants/cache_keys");
const createPost = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = app_context_1.AppContext.getInstance().getPool();
    const redis = app_context_1.AppContext.getInstance().getRedisClient();
    const cacheKey = `POST:${body.id}`;
    try {
        const result = yield pool.query("INSERT INTO posts (id,content, title) VALUES ($1, $2, $3)", [body.id, body.content, body.title]);
        // Set cache
        redis.set(cacheKey, JSON.stringify(body), "EX", 86400);
        // Push anlysis task to redis queue
        redis.rpush(cache_keys_1.PostAnalysisJobQueueKey, body.id);
        return;
    }
    catch (error) {
        throw error;
    }
});
exports.createPost = createPost;
const fetchPost = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const redis = app_context_1.AppContext.getInstance().getRedisClient();
    const cacheKey = `POST:${postId}`;
    const cachedData = yield redis.get(cacheKey);
    if (cachedData) {
        // If data exists in the cache, return it
        return JSON.parse(cachedData);
    }
    else {
        const pool = app_context_1.AppContext.getInstance().getPool();
        try {
            let result = yield pool.query("SELECT id,content,title FROM posts WHERE id=$1", [postId]);
            if (result.rows.length != 1) {
                throw Error("invalid id requested");
            }
            // Set cache
            redis.set(cacheKey, JSON.stringify(result.rows[0]), "EX", 86400);
            return result.rows[0];
        }
        catch (error) {
            throw error;
        }
    }
});
exports.fetchPost = fetchPost;
const fetchAllPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const pool = app_context_1.AppContext.getInstance().getPool();
    try {
        let result = yield pool.query("SELECT id,content,title FROM posts");
        return result.rows;
    }
    catch (error) {
        throw error;
    }
});
exports.fetchAllPosts = fetchAllPosts;
const fetchPostAnalysis = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = app_context_1.AppContext.getInstance().getPool();
    try {
        let result = yield pool.query("SELECT content,word_count,avg_word_length FROM posts WHERE id=$1", [postId]);
        if (result.rows.length != 1) {
            throw Error("invalid id requested");
        }
        if (result.rows[0].word_count != null) {
            return {
                id: postId,
                total_words: result.rows[0].word_count,
                avg_word_length: result.rows[0].avg_word_length,
            };
        }
        let postContent = result.rows[0].content;
        let { totalWords, avgWordLength } = (0, exports.analyzeString)(postContent);
        result = yield pool.query("UPDATE posts SET word_count = $1, avg_word_length = $2 WHERE id = $3;", [totalWords, avgWordLength, postId]);
        return {
            id: postId,
            total_words: totalWords,
            avg_word_length: avgWordLength,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.fetchPostAnalysis = fetchPostAnalysis;
const analyzeString = (input) => {
    // Remove leading and trailing spaces and split the string into words
    const words = input.trim().split(/\s+/);
    // Calculate the total number of words
    const totalWords = words.length;
    // Calculate the total length of all words
    const totalLength = words.reduce((acc, word) => acc + word.length, 0);
    // Calculate the average length of words (handle division by zero)
    const avgWordLength = totalWords > 0 ? totalLength / totalWords : 0;
    return { totalWords, avgWordLength };
};
exports.analyzeString = analyzeString;
