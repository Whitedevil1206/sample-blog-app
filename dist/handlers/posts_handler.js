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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPostAnalysis = exports.fetchAllPosts = exports.fetchPost = exports.createPost = void 0;
const postApiService = __importStar(require("../services/post_service"));
const logUtils = __importStar(require("../utils/logging"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validation
    if (req.body.content == undefined ||
        req.body.title == undefined ||
        req.body.id == undefined) {
        res.status(400).send("require id, content & title");
    }
    try {
        yield postApiService.createPost(req.body);
        res.status(200).send();
    }
    catch (error) {
        logUtils.log(logUtils.LogLevels.Error, "Error creating record:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createPost = createPost;
const fetchPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    try {
        let post = yield postApiService.fetchPost(postId);
        res.status(200).json(post);
    }
    catch (error) {
        logUtils.log(logUtils.LogLevels.Error, "Error fetching record:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.fetchPost = fetchPost;
const fetchAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let post = yield postApiService.fetchAllPosts();
        res.status(200).json(post);
    }
    catch (error) {
        logUtils.log(logUtils.LogLevels.Error, "Error fetching record:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.fetchAllPosts = fetchAllPosts;
const fetchPostAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    try {
        let postAnalysis = yield postApiService.fetchPostAnalysis(postId);
        res.status(200).json(postAnalysis);
    }
    catch (error) {
        logUtils.log(logUtils.LogLevels.Error, "Error fetching analysis record:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.fetchPostAnalysis = fetchPostAnalysis;
