import { eq, sql } from "drizzle-orm";

import "./migrate";
import { db } from "./index";
import { sentences, topics } from "./schema";
import { generateSentences } from "../lib/llm";

const starterTopics = [
  {
    name: "Politics & Government",
    description: "Civic life, elections, public policy, and government services.",
  },
  {
    name: "Technology & Internet",
    description: "Digital tools, online culture, cybersecurity, and software.",
  },
  {
    name: "Academic & Research",
    description: "Campus life, research methods, scholarly writing, and study skills.",
  },
  {
    name: "Daily Conversation",
    description: "Everyday situations, casual plans, errands, and social phrases.",
  },
  {
    name: "Business & Economics",
    description: "Workplace communication, markets, finance, and economic trends.",
  },
  {
    name: "Programming & Software",
    description: "Coding concepts, software development, debugging, and developer tools.",
  },
  {
    name: "Database & Data",
    description: "SQL queries, data modeling, NoSQL concepts, and data engineering.",
  },
  {
    name: "AI & Machine Learning",
    description: "Neural networks, training, inference, LLMs, and AI research vocabulary.",
  },
  {
    name: "Education & Learning",
    description: "Classroom interactions, curriculum design, teaching methods, and academic life.",
  },
  {
    name: "Health & Medicine",
    description: "Medical terms, patient care, public health, and clinical communication.",
  },
  {
    name: "Environment & Climate",
    description: "Sustainability, climate change, renewable energy, and environmental policy.",
  },
  {
    name: "Travel & Culture",
    description: "Transportation, accommodation, cultural experiences, and travel phrases.",
  },
];

async function main() {
  for (const starterTopic of starterTopics) {
    let topic = db
      .select()
      .from(topics)
      .where(eq(topics.name, starterTopic.name))
      .get();

    if (!topic) {
      topic = db.insert(topics).values(starterTopic).returning().get();
      console.log(`Created topic: ${topic.name}`);
    }

    const sentenceCount = db
      .select({ count: sql<number>`count(*)` })
      .from(sentences)
      .where(eq(sentences.topicId, topic.id))
      .get()?.count ?? 0;

    if (sentenceCount > 0) {
      console.log(`Skipping ${topic.name}: already has ${sentenceCount} sentences`);
      continue;
    }

    try {
      console.log(`Generating sentences for ${topic.name}...`);
      const generated = await generateSentences(topic.name);

      db.insert(sentences)
        .values(
          generated.map((sentence) => ({
            topicId: topic.id,
            text: sentence.text,
            translation: sentence.translation,
            formality: sentence.formality,
            metadata: JSON.stringify(sentence.metadata),
          })),
        )
        .run();

      console.log(`Saved ${generated.length} sentences for ${topic.name}`);
    } catch (error) {
      console.error(
        `Failed to generate sentences for ${topic.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
