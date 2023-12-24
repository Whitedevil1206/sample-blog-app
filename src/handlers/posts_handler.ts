import express from "express";
import * as postApiService from "../services/post_service";
import * as logUtils from "../utils/logging";

export const createPost = async (
  req: express.Request,
  res: express.Response
) => {
  // Validation
  if (
    req.body.content == undefined ||
    req.body.title == undefined ||
    req.body.id == undefined
  ) {
    res.status(400).send("require id, content & title");
  }
  try {
    await postApiService.createPost(req.body);
    res.status(200).send();
  } catch (error) {
    logUtils.log(logUtils.LogLevels.Error, "Error creating record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchPost = async (
  req: express.Request,
  res: express.Response
) => {
  const postId = req.params.postId;

  try {
    let post: Post = await postApiService.fetchPost(postId);
    res.status(200).json(post);
  } catch (error) {
    logUtils.log(logUtils.LogLevels.Error, "Error fetching record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchAllPosts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let post: Post[] = await postApiService.fetchAllPosts();
    res.status(200).json(post);
  } catch (error) {
    logUtils.log(logUtils.LogLevels.Error, "Error fetching record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchPostAnalysis = async (
  req: express.Request,
  res: express.Response
) => {
  const postId = req.params.postId;
  try {
    let postAnalysis: PostAnalysis = await postApiService.fetchPostAnalysis(
      postId
    );
    res.status(200).json(postAnalysis);
  } catch (error) {
    logUtils.log(
      logUtils.LogLevels.Error,
      "Error fetching analysis record:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};
