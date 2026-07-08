import { NextResponse } from "next/server";

import { db } from "@/db";
import { topics } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ topics: db.select().from(topics).all() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load topics" }, { status: 500 });
  }
}
