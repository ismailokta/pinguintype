import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";

const DB_PATH = join(process.cwd(), "data", "pinguintype.db");

mkdirSync(join(process.cwd(), "data"), { recursive: true });

const sqlite = new Database(DB_PATH);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS sentences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id),
    text TEXT NOT NULL,
    translation TEXT NOT NULL DEFAULT '',
    formality TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );
`);

try {
  sqlite.exec("ALTER TABLE sentences ADD COLUMN translation TEXT NOT NULL DEFAULT '';");
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("duplicate column")) {
    throw error;
  }
}

console.log("Database migrated successfully");
