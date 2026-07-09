import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { sentences, topics } from "@/db/schema";
import { generateSentences, parseMetadata } from "@/lib/llm";

export const runtime = "nodejs";

export async function POST(
  request: Request,
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

    const count = await getCount(request);
    const generated = await generateSentences(topic.name, count);
    if (generated.length === 0) throw new Error("LLM returned no sentences");

    const rows = db.transaction((tx) => {
      tx.delete(sentences).where(eq(sentences.topicId, topic.id)).run();
      return tx
        .insert(sentences)
        .values(
          generated.map((sentence) => ({
            topicId: topic.id,
            text: sentence.text,
            translation: sentence.translation,
            formality: sentence.formality,
            metadata: JSON.stringify(sentence.metadata),
          })),
        )
        .returning()
        .all();
    });

    return NextResponse.json({
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
      },
      sentences: rows.map((sentence) => ({
        id: sentence.id,
        text: sentence.text,
        translation: sentence.translation,
        formality: sentence.formality,
        metadata: parseMetadata(sentence.metadata),
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to regenerate sentences" },
      { status: 502 },
    );
  }
}

async function getCount(request: Request) {
  const queryCount = new URL(request.url).searchParams.get("count");
  const body = (await request.json().catch(() => ({}))) as { count?: unknown };
  const raw = queryCount ?? body.count;
  const count = Number(raw ?? 10);

  if (!Number.isFinite(count)) return 10;
  return Math.min(50, Math.max(1, Math.trunc(count)));
}
