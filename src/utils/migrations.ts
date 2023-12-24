import { Pool } from "pg";

export const migrateTables = (pool: Pool) => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS posts (id VARCHAR(255) PRIMARY KEY,content VARCHAR(255) NOT NULL,title VARCHAR(255) NOT NULL,word_count bigint,avg_word_length float,archive boolean default false)"
  );
};
