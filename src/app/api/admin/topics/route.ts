import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { sentences, topics } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = db
      .select({
        id: topics.id,
        name: topics.name,
        description: topics.description,
        sentenceCount: sql<number>`count(${sentences.id})`,
      })
      .from(topics)
      .leftJoin(sentences, eq(topics.id, sentences.topicId))
      .groupBy(topics.id)
      .all();

    return NextResponse.json({ topics: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load admin topics" },
      { status: 500 },
    );
  }
}
