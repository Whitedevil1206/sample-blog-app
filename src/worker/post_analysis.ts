import { QueryResult } from "pg";
import { AppContext } from "../app_context/app_context";
import { PostAnalysisJobQueueKey } from "../constants/cache_keys";
import { analyzeString } from "../services/post_service";
import { log, LogLevels } from "../utils/logging";

const PostAnalysisWorker = async () => {
  const redis = AppContext.getInstance().getRedisClient();
  const pool = AppContext.getInstance().getPool();
  let postId = await redis.lpop(PostAnalysisJobQueueKey);
  if (postId) {
    let result: QueryResult = await pool.query(
      "SELECT content,word_count,avg_word_length FROM posts WHERE id=$1",
      [postId]
    );

    let postContent: string = result.rows[0].content;
    let { totalWords, avgWordLength } = analyzeString(postContent);

    result = await pool.query(
      "UPDATE posts SET word_count = $1, avg_word_length = $2 WHERE id = $3;",
      [totalWords, avgWordLength, postId]
    );
    log(LogLevels.Info, "Post Analysis Worker Job Done", `id: ${postId}`);
  }
};

export const SetupPostAnalysisWorker = () => {
  setInterval(() => {
    log(LogLevels.Info, "Post Analysis Worker Job Queue Check");
    PostAnalysisWorker();
  }, 10000);
};
