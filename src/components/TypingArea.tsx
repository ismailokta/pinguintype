"use client";

import { useEffect, useRef } from "react";
import type { Sentence } from "@/lib/types";

type TypingAreaProps = {
  sentence: Sentence | null;
  userInput: string;
  isTyping: boolean;
  focusSignal: number;
  completedId: number | null;
  onInputChange: (value: string) => void;
  onTypingChange: (typing: boolean) => void;
  onComplete: () => void;
};

export function TypingArea({
  sentence,
  userInput,
  isTyping,
  focusSignal,
  completedId,
  onInputChange,
  onTypingChange,
  onComplete,
}: TypingAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    completedRef.current = false;
  }, [sentence?.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" && document.activeElement !== textareaRef.current) {
        event.preventDefault();
        textareaRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === textareaRef.current) {
        textareaRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!sentence) {
    return (
      <section className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-500">
        Pick sentence to start typing.
      </section>
    );
  }

  const correct = userInput === sentence.text;

  function handleChange(value: string) {
    onInputChange(value);

    if (value === sentence?.text && !completedRef.current) {
      completedRef.current = true;
      window.setTimeout(onComplete, 420);
    }
  }

  return (
    <section
      className={`rounded-[2rem] border border-white/10 bg-[#11111f]/90 p-5 shadow-2xl shadow-black/30 transition duration-200 md:p-7 ${completedId === sentence.id ? "complete-flash" : ""}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Reference
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Enter focuses · Escape exits · exact match advances
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${isTyping ? "bg-purple-500/15 text-purple-200 ring-1 ring-purple-400/30" : "bg-white/5 text-slate-500 ring-1 ring-white/10"}`}
        >
          {isTyping ? "typing" : "idle"}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 font-mono text-xl leading-9 text-slate-400 md:text-2xl md:leading-10">
        {sentence.text}
      </div>

      <div className="mt-4 rounded-3xl border border-purple-400/20 bg-[#0f0f1a] p-5 ring-1 ring-purple-500/10 transition focus-within:border-purple-300/60 focus-within:ring-4 focus-within:ring-purple-500/10">
        <div className="min-h-20 whitespace-pre-wrap break-words font-mono text-xl leading-9 md:text-2xl md:leading-10">
          {sentence.text.split("").map((char, index) => {
            const typed = userInput[index];
            const typedPastEnd = index < userInput.length;
            const className = !typedPastEnd
              ? "text-slate-600"
              : typed === char
                ? "text-emerald-300"
                : "rounded bg-red-500/20 text-red-300";

            return (
              <span key={`${sentence.id}-${index}`} className={className}>
                {char}
              </span>
            );
          })}
          {userInput.slice(sentence.text.length).split("").map((char, index) => (
            <span key={`extra-${index}`} className="rounded bg-red-500/25 text-red-300">
              {char}
            </span>
          ))}
          <span className="ml-0.5 inline-block h-7 w-0.5 translate-y-1 bg-purple-300 opacity-80" />
        </div>

        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => onTypingChange(true)}
          onBlur={() => onTypingChange(false)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-base leading-7 text-slate-100 caret-purple-300 outline-none transition placeholder:text-slate-600 focus:border-purple-400/60 focus:bg-white/[0.05]"
          placeholder="Retype sentence here..."
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{userInput.length}/{sentence.text.length} chars</span>
        <span className={correct ? "text-emerald-300" : ""}>
          {correct ? "complete" : "keep going"}
        </span>
      </div>
    </section>
  );
}
