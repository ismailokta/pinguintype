import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";

import * as schema from "./schema";

const DB_PATH = join(process.cwd(), "data", "pinguintype.db");
mkdirSync(join(process.cwd(), "data"), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
