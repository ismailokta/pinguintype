import OpenAI from "openai";

export type Formality = "formal" | "informal" | "conversational";

export type SentenceMetadata = {
  tense: string;
  voice: string;
  structure: string;
  difficulty: string;
  notes: string;
};

export type GeneratedSentence = {
  text: string;
  formality: Formality;
  metadata: SentenceMetadata;
};

const client = new OpenAI({
  baseURL: "https://gemma4.emka.web.id/v1/",
  apiKey: "not-needed",
});

let model = "gemma-3-27b-it";
const formalities: Formality[] = ["formal", "informal", "conversational"];

export function buildSentencePrompt(topicName: string) {
  return `Generate 10 English sentences about "${topicName}" for English language learners.
You are a language teacher creating varied practice material.

Requirements:
- Mix of formality levels: formal, informal, conversational
- Diverse grammar: simple past, present perfect, past continuous, passive voice, conditionals, modals
- Sentence length: 8-20 words
- Natural, authentic English that a learner would encounter in real life

Output as JSON:
{
  "sentences": [
    {
      "text": "The complete English sentence here.",
      "formality": "formal",
      "metadata": {
        "tense": "present perfect",
        "voice": "active",
        "structure": "Subject + have/has + past participle + object",
        "difficulty": "intermediate",
        "notes": "Used to describe past actions with present relevance"
      }
    }
  ]
}`;
}

export async function generateSentences(topicName: string) {
  const response = await createCompletion(topicName);

  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("LLM returned empty content");

  return normalizeSentences(JSON.parse(stripFence(content)));
}

async function createCompletion(topicName: string) {
  try {
    return await requestCompletion(topicName, model);
  } catch (error) {
    if ((error as { status?: number }).status !== 404) throw error;

    const fallback = (await client.models.list()).data[0]?.id;
    if (!fallback || fallback === model) throw error;

    model = fallback;
    return requestCompletion(topicName, model);
  }
}

function requestCompletion(topicName: string, selectedModel: string) {
  return client.chat.completions.create({
    model: selectedModel,
    messages: [
      { role: "system", content: "You output valid JSON only." },
      { role: "user", content: buildSentencePrompt(topicName) },
    ],
    response_format: { type: "json_object" },
  });
}

export function parseMetadata(value: string): SentenceMetadata {
  return JSON.parse(value) as SentenceMetadata;
}

function stripFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function normalizeSentences(value: unknown): GeneratedSentence[] {
  const items = (value as { sentences?: unknown[] }).sentences;
  if (!Array.isArray(items)) throw new Error("LLM response missing sentences array");

  return items.slice(0, 10).map((item, index) => {
    const sentence = item as Partial<GeneratedSentence>;
    const metadata = sentence.metadata ?? ({} as SentenceMetadata);

    if (!sentence.text) throw new Error(`LLM sentence ${index + 1} missing text`);

    return {
      text: sentence.text,
      formality: formalities.includes(sentence.formality as Formality)
        ? (sentence.formality as Formality)
        : formalities[index % formalities.length],
      metadata: {
        tense: metadata.tense ?? "unknown",
        voice: metadata.voice ?? "unknown",
        structure: metadata.structure ?? "unknown",
        difficulty: metadata.difficulty ?? "intermediate",
        notes: metadata.notes ?? "",
      },
    };
  });
}
