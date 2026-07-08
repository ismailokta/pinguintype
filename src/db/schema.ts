import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});

export const sentences = sqliteTable("sentences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topicId: integer("topic_id")
    .references(() => topics.id)
    .notNull(),
  text: text("text").notNull(),
  formality: text("formality").notNull(),
  metadata: text("metadata").notNull(),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});
