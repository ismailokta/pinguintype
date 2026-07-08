"use client";

import type { ReactNode } from "react";
import type { Sentence } from "@/lib/types";

type SentenceListProps = {
  sentences: Sentence[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

const cardStyles: Record<Sentence["formality"], string> = {
  formal: "border-blue-800/30 bg-blue-900/20 before:bg-blue-400",
  informal: "border-green-800/30 bg-green-900/20 before:bg-green-400",
  conversational: "border-purple-800/30 bg-purple-900/20 before:bg-purple-400",
};

const badgeStyles: Record<Sentence["formality"], string> = {
  formal: "bg-blue-400/10 text-blue-200 ring-blue-400/20",
  informal: "bg-green-400/10 text-green-200 ring-green-400/20",
  conversational: "bg-purple-400/10 text-purple-200 ring-purple-400/20",
};

export function SentenceList({
  sentences,
  selectedIndex,
  onSelectIndex,
}: SentenceListProps) {
  if (sentences.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-slate-500">
        No sentences yet.
      </div>
    );
  }

  return (
    <div className="scroll-smooth pr-1 md:max-h-[42vh] md:overflow-y-auto">
      <div className="grid gap-3">
        {sentences.map((sentence, index) => {
          const selected = index === selectedIndex;

          return (
            <button
              key={sentence.id}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 before:absolute before:inset-y-4 before:left-0 before:w-0.5 hover:-translate-y-0.5 hover:border-purple-400/50 hover:bg-white/[0.06] ${cardStyles[sentence.formality]} ${selected ? "border-purple-400/80 shadow-[0_0_30px_rgba(124,58,237,0.18)] ring-1 ring-purple-400/30" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 font-mono text-xs text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${badgeStyles[sentence.formality]}`}
                    >
                      {sentence.formality}
                    </span>
                    {selected ? (
                      <span className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_16px_rgba(216,180,254,0.9)]" />
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-200">
                    {sentence.text}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip>{sentence.metadata.tense}</Chip>
                    <Chip>{sentence.metadata.voice}</Chip>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs text-slate-400 ring-1 ring-white/10">
      {children}
    </span>
  );
}
