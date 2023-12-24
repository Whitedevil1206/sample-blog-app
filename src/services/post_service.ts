import { AppContext } from "../app_context/app_context";
import { QueryResult } from "pg";
import { PostAnalysisJobQueueKey } from "../constants/cache_keys";

export const createPost = async (body: Post) => {
  const pool = AppContext.getInstance().getPool();
  const redis = AppContext.getInstance().getRedisClient();
  const cacheKey = `POST:${body.id}`;
  try {
    const result = await pool.query(
      "INSERT INTO posts (id,content, title) VALUES ($1, $2, $3)",
      [body.id, body.content, body.title]
    );
    // Set cache
    redis.set(cacheKey, JSON.stringify(body), "EX", 86400);
    // Push anlysis task to redis queue
    redis.rpush(PostAnalysisJobQueueKey, body.id);
    return;
  } catch (error) {
    throw error;
  }
};

export const fetchPost = async (postId: string): Promise<Post> => {
  const redis = AppContext.getInstance().getRedisClient();
  const cacheKey = `POST:${postId}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    // If data exists in the cache, return it
    return JSON.parse(cachedData);
  } else {
    const pool = AppContext.getInstance().getPool();
    try {
      let result: QueryResult = await pool.query(
        "SELECT id,content,title FROM posts WHERE id=$1",
        [postId]
      );
      if (result.rows.length != 1) {
        throw Error("invalid id requested");
      }
      // Set cache
      redis.set(cacheKey, JSON.stringify(result.rows[0]), "EX", 86400);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
};

export const fetchAllPosts = async (): Promise<Post[]> => {
  const pool = AppContext.getInstance().getPool();
  try {
    let result: QueryResult = await pool.query(
      "SELECT id,content,title FROM posts"
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const fetchPostAnalysis = async (
  postId: string
): Promise<PostAnalysis> => {
  const pool = AppContext.getInstance().getPool();
  try {
    let result: QueryResult = await pool.query(
      "SELECT content,word_count,avg_word_length FROM posts WHERE id=$1",
      [postId]
    );
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

    let postContent: string = result.rows[0].content;
    let { totalWords, avgWordLength } = analyzeString(postContent);

    result = await pool.query(
      "UPDATE posts SET word_count = $1, avg_word_length = $2 WHERE id = $3;",
      [totalWords, avgWordLength, postId]
    );

    return {
      id: postId,
      total_words: totalWords,
      avg_word_length: avgWordLength,
    };
  } catch (error) {
    throw error;
  }
};

export const analyzeString = (
  input: string
): {
  totalWords: number;
  avgWordLength: number;
} => {
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
