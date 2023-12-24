"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateTables = void 0;
const migrateTables = (pool) => {
    pool.query("CREATE TABLE IF NOT EXISTS posts (id VARCHAR(255) PRIMARY KEY,content VARCHAR(255) NOT NULL,title VARCHAR(255) NOT NULL,word_count bigint,avg_word_length float,archive boolean default false)");
};
exports.migrateTables = migrateTables;
