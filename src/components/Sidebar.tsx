"use client";

import type { Sentence, Topic } from "@/lib/types";

type SidebarProps = {
  topics: Topic[];
  selectedTopicId: number | null;
  onSelectTopic: (id: number) => void;
  currentSentence: Sentence | null;
  selectedTopic: Topic | null;
};

const formalityStyles: Record<Sentence["formality"], string> = {
  formal: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  informal: "border-green-500/40 bg-green-500/10 text-green-200",
  conversational: "border-purple-500/40 bg-purple-500/10 text-purple-200",
};

export function Sidebar({
  topics,
  selectedTopicId,
  onSelectTopic,
  currentSentence,
  selectedTopic,
}: SidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-[#0b0b14]/80 p-5 backdrop-blur-xl md:h-screen md:w-[280px] md:border-r md:border-b-0">
      <div className="mb-8">
        <div className="font-mono text-2xl font-black tracking-tight text-white">
          pinguin<span className="text-purple-400">type</span>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-500">
          English reps
        </p>
      </div>

      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Topic
      </label>
      <select
        value={selectedTopicId ?? ""}
        onChange={(event) => onSelectTopic(Number(event.target.value))}
        className="mt-3 rounded-2xl border border-white/10 bg-[#1a1a2e] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30"
        disabled={topics.length === 0}
      >
        {topics.length === 0 ? (
          <option>No topics</option>
        ) : (
          topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))
        )}
      </select>

      {selectedTopic ? (
        <p className="mt-4 text-sm leading-6 text-slate-400">
          {selectedTopic.description}
        </p>
      ) : null}

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Current sentence
        </h2>

        {currentSentence ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/20">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${formalityStyles[currentSentence.formality]}`}
            >
              {currentSentence.formality}
            </span>

            <dl className="mt-5 space-y-4 text-sm">
              <Meta label="Tense" value={currentSentence.metadata.tense} />
              <Meta label="Voice" value={currentSentence.metadata.voice} />
              <Meta label="Structure" value={currentSentence.metadata.structure} />
              {currentSentence.metadata.difficulty ? (
                <Meta label="Difficulty" value={currentSentence.metadata.difficulty} />
              ) : null}
              {currentSentence.metadata.notes ? (
                <Meta label="Notes" value={currentSentence.metadata.notes} />
              ) : null}
            </dl>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
            Select topic to see grammar details.
          </div>
        )}
      </section>
    </aside>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-600">{label}</dt>
      <dd className="mt-1 leading-5 text-slate-200">{value}</dd>
    </div>
  );
}
