import express, { Router } from "express";
const router: Router = express.Router();

// Import the controller
import * as postApiHandler from "../handlers/posts_handler";

// Define routes and their corresponding controller methods
router.post("/", postApiHandler.createPost);
router.get("/", postApiHandler.fetchAllPosts);
router.get("/:postId", postApiHandler.fetchPost);
router.get("/:postId/analysis/", postApiHandler.fetchPostAnalysis);

export default router;
