"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Sentence } from "@/lib/types";

interface AdminTopic {
  id: number;
  name: string;
  description: string;
  sentenceCount: number;
}

type TopicsResponse = { topics: AdminTopic[] };
type SentencesResponse = { sentences: Sentence[] };

const formalityStyles: Record<Sentence["formality"], string> = {
  formal: "bg-blue-400/10 text-blue-200 ring-blue-400/20",
  informal: "bg-green-400/10 text-green-200 ring-green-400/20",
  conversational: "bg-purple-400/10 text-purple-200 ring-purple-400/20",
};

export default function AdminPage() {
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
  const [sentencesByTopic, setSentencesByTopic] = useState<Record<number, Sentence[]>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSentencesId, setLoadingSentencesId] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [sentenceCount, setSentenceCount] = useState(10);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/topics");
      if (!response.ok) throw new Error("Could not load admin topics.");
      const data = (await response.json()) as TopicsResponse;
      setTopics(data.topics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load admin topics.");
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  const loadSentences = useCallback(async (topicId: number) => {
    setLoadingSentencesId(topicId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/topics/${topicId}/sentences`);
      if (!response.ok) throw new Error("Could not load sentences.");
      const data = (await response.json()) as SentencesResponse;
      setSentencesByTopic((current) => ({ ...current, [topicId]: data.sentences }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load sentences.");
    } finally {
      setLoadingSentencesId(null);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadTopics(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTopics]);

  async function toggleSentences(topicId: number) {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
      return;
    }

    setExpandedTopicId(topicId);
    if (!sentencesByTopic[topicId]) await loadSentences(topicId);
  }

  async function regenerate(topicId: number) {
    if (isRegenerating) return;
    if (!window.confirm("This will replace all sentences for this topic. Continue?")) return;

    setIsRegenerating(true);
    setRegeneratingId(topicId);
    setNotice(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/topics/${topicId}/regenerate?count=${sentenceCount}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: sentenceCount }),
      });
      if (!response.ok) throw new Error("Could not regenerate sentences.");
      setNotice(`${sentenceCount} sentences regenerated.`);
      await Promise.all([loadTopics(), loadSentences(topicId)]);
      setExpandedTopicId(topicId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not regenerate sentences.");
    } finally {
      setIsRegenerating(false);
      setRegeneratingId(null);
    }
  }

  return (
    <main className="h-screen overflow-y-auto overscroll-contain bg-[#0f0f1a] px-4 py-5 text-slate-200 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <Link href="/" className="text-sm text-slate-400 transition hover:text-purple-200">
              ← Back to app
            </Link>
            <div className="md:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300">
                Control room
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
                pinguintype Admin
              </h1>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <label className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              Sentences to generate
              <input
                type="number"
                min={1}
                max={50}
                value={sentenceCount}
                disabled={isRegenerating}
                onChange={(event) =>
                  setSentenceCount(Math.min(50, Math.max(1, Number(event.target.value) || 1)))
                }
                className="h-10 w-24 rounded-full border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-slate-100 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-wait disabled:opacity-60"
              />
            </label>
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-200/70 ring-1 ring-purple-400/20">
              global
            </span>
          </div>
        </header>

        {notice ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loadingTopics ? (
          <LoadingTopics />
        ) : topics.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-slate-500">
            No admin topics found.
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <section key={topic.id} className="rounded-[2rem] border border-white/10 bg-[#11111f]/85 p-5 shadow-2xl shadow-black/20">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{topic.name}</h2>
                      <span className="rounded-full bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-200 ring-1 ring-purple-400/20">
                        {topic.sentenceCount} sentences
                      </span>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{topic.description}</p>
                  </div>

                  <div className="flex flex-wrap items-end gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleSentences(topic.id)}
                      className="rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
                    >
                      {expandedTopicId === topic.id ? "Hide Sentences" : "View Sentences"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void regenerate(topic.id)}
                      disabled={isRegenerating}
                      title={isRegenerating && regeneratingId !== topic.id ? "Another topic is regenerating..." : undefined}
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-60"
                    >
                      {regeneratingId === topic.id ? "Regenerating..." : "Regenerate"}
                    </button>
                  </div>
                </div>

                {expandedTopicId === topic.id ? (
                  <div className="mt-5">
                    {loadingSentencesId === topic.id ? (
                      <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
                    ) : (
                      <SentenceTable sentences={sentencesByTopic[topic.id] ?? []} />
                    )}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SentenceTable({ sentences }: { sentences: Sentence[] }) {
  if (sentences.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
        No sentences for this topic.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10">
      <table className="min-w-[980px] w-full border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="p-4">#</th>
            <th className="p-4">English</th>
            <th className="p-4">Indonesian</th>
            <th className="p-4">Formality</th>
            <th className="p-4">Tense</th>
            <th className="p-4">Voice</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map((sentence, index) => (
            <tr key={sentence.id} className="border-t border-white/10 odd:bg-white/[0.015] even:bg-black/10">
              <td className="p-4 font-mono text-slate-500">{index + 1}</td>
              <td className="max-w-md p-4 leading-6 text-slate-200">{sentence.text}</td>
              <td className="max-w-md p-4 italic leading-6 text-emerald-100/70">
                {sentence.translation || "No translation available"}
              </td>
              <td className="p-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${formalityStyles[sentence.formality]}`}>
                  {sentence.formality}
                </span>
              </td>
              <td className="p-4 text-slate-400">{sentence.metadata.tense}</td>
              <td className="p-4 text-slate-400">{sentence.metadata.voice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingTopics() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]" />
      ))}
    </div>
  );
}
