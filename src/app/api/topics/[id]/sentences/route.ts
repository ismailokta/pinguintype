import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { sentences, topics } from "@/db/schema";
import { parseMetadata } from "@/lib/llm";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid topic id" }, { status: 400 });
    }

    const topic = db.select().from(topics).where(eq(topics.id, id)).get();
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const rows = db
      .select()
      .from(sentences)
      .where(eq(sentences.topicId, id))
      .all();

    return NextResponse.json({
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
      },
      sentences: rows.map((sentence) => ({
        id: sentence.id,
        text: sentence.text,
        formality: sentence.formality,
        metadata: parseMetadata(sentence.metadata),
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load topic sentences" },
      { status: 500 },
    );
  }
}
