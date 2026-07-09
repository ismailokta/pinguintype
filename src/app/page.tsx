"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SentenceList } from "@/components/SentenceList";
import { Sidebar } from "@/components/Sidebar";
import { TypingArea } from "@/components/TypingArea";
import type { Sentence, Topic } from "@/lib/types";

type TopicsResponse = { topics: Topic[] };
type SentencesResponse = { topic: Topic; sentences: Sentence[] };

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [completedId, setCompletedId] = useState<number | null>(null);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [topics, selectedTopicId],
  );
  const currentSentence = sentences[selectedSentenceIndex] ?? null;

  const selectSentence = useCallback((index: number) => {
    setSelectedSentenceIndex(index);
    setUserInput("");
  }, []);

  const loadSentences = useCallback(async (topicId: number) => {
    setLoadingSentences(true);
    setError(null);

    try {
      const response = await fetch(`/api/topics/${topicId}/sentences`);
      if (!response.ok) throw new Error("Could not load sentences.");

      const data = (await response.json()) as SentencesResponse;
      setSentences(data.sentences);
      setSelectedSentenceIndex(0);
      setUserInput("");
    } catch (loadError) {
      setSentences([]);
      setError(loadError instanceof Error ? loadError.message : "Could not load sentences.");
    } finally {
      setLoadingSentences(false);
    }
  }, []);

  useEffect(() => {
    async function loadTopics() {
      setLoadingTopics(true);
      setError(null);

      try {
        const response = await fetch("/api/topics");
        if (!response.ok) throw new Error("Could not load topics.");

        const data = (await response.json()) as TopicsResponse;
        setTopics(data.topics);

        if (data.topics[0]) {
          setSelectedTopicId(data.topics[0].id);
          await loadSentences(data.topics[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load topics.");
      } finally {
        setLoadingTopics(false);
      }
    }

    void loadTopics();
  }, [loadSentences]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTyping || sentences.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectSentence(Math.min(selectedSentenceIndex + 1, sentences.length - 1));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        selectSentence(Math.max(selectedSentenceIndex - 1, 0));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, selectSentence, selectedSentenceIndex, sentences.length]);

  async function handleSelectTopic(topicId: number) {
    setSelectedTopicId(topicId);
    await loadSentences(topicId);
  }

  function handleComplete() {
    if (!currentSentence) return;

    setCompletedId(currentSentence.id);
    const nextIndex = (selectedSentenceIndex + 1) % sentences.length;

    window.setTimeout(() => {
      setUserInput("");
      setCompletedId(null);
      setSelectedSentenceIndex(nextIndex);
      setFocusSignal((signal) => signal + 1);
    }, 180);
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0f0f1a] text-slate-200 md:flex-row">
      <Sidebar
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={(id) => void handleSelectTopic(id)}
        currentSentence={currentSentence}
        selectedTopic={selectedTopic}
      />

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 md:h-screen md:p-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-purple-300">
                Topic deck
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {selectedTopic?.name ?? "Loading topics"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                {selectedTopic?.description ?? "Fetch practice sentences, then retype with precision."}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-4 text-right">
              <div className="font-mono text-3xl font-bold text-purple-200">
                {sentences.length}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-purple-300/70">
                sentences
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loadingTopics || loadingSentences ? (
          <LoadingState />
        ) : topics.length === 0 ? (
          <EmptyState title="No topics found" body="Backend returned empty topic list." />
        ) : (
          <div className="grid min-h-0 flex-1 gap-5 xl:grid-rows-[minmax(0,1fr)_auto]">
            <SentenceList
              sentences={sentences}
              selectedIndex={selectedSentenceIndex}
              onSelectIndex={selectSentence}
            />
            <TypingArea
              sentence={currentSentence}
              userInput={userInput}
              isTyping={isTyping}
              focusSignal={focusSignal}
              completedId={completedId}
              onInputChange={setUserInput}
              onTypingChange={setIsTyping}
              onComplete={handleComplete}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-slate-500">{body}</p>
      </div>
    </div>
  );
}
