"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import { ArgumentReveal } from "@/components/ArgumentReveal";
import { EmojiScale } from "@/components/EmojiScale";
import { GlassCard } from "@/components/GlassCard";
import { ImportancePicker } from "@/components/ImportancePicker";
import { quiz } from "@/lib/data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/store";
import type { UserAnswer } from "@/lib/types";

/**
 * Single source of truth: `answers` (an array of UserAnswer).
 * Everything else — current score, importance, position in the deck — is
 * derived from it on each render. No effects sync UI state from storage,
 * so the stale-closure bug from the first iteration cannot recur.
 */
export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Mount: restore prior progress (if any) and jump to first unanswered question.
  useEffect(() => {
    const saved = loadAnswers();
    setAnswers(saved);
    if (saved.length > 0 && saved.length < quiz.questions.length) {
      const firstUnanswered = quiz.questions.findIndex(
        (q) => !saved.some((a) => a.questionId === q.id)
      );
      if (firstUnanswered !== -1) setIndex(firstUnanswered);
    }
    setHydrated(true);
  }, []);

  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const answersById = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a])),
    [answers]
  );
  const current = answersById.get(question.id);
  const score = current?.score ?? null;
  const importance = current?.importance ?? 2;
  const answeredCount = answers.length;
  const progress = ((index + (score !== null ? 1 : 0)) / total) * 100;

  // -------- mutators (always go through this so localStorage stays in sync)
  const upsert = useCallback(
    (next: Partial<UserAnswer> & { questionId: string }) => {
      setAnswers((prev) => {
        const existing = prev.find((a) => a.questionId === next.questionId);
        const merged: UserAnswer = {
          questionId: next.questionId,
          score: next.score ?? existing?.score ?? 4,
          importance: next.importance ?? existing?.importance ?? 2,
        };
        const updated = [
          ...prev.filter((a) => a.questionId !== next.questionId),
          merged,
        ];
        saveAnswers(updated);
        return updated;
      });
    },
    []
  );

  function pickScore(s: number) {
    upsert({ questionId: question.id, score: s });
    // Auto-advance after a short delay so the user sees the confirmation animation.
    setTimeout(() => {
      setIndex((i) => (i + 1 < total ? i + 1 : i));
      if (index + 1 >= total) router.push("/results");
    }, 520);
  }

  function pickImportance(i: number) {
    upsert({ questionId: question.id, importance: i });
  }

  function next() {
    if (index + 1 < total) setIndex(index + 1);
    else router.push("/results");
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  function jumpTo(i: number) {
    if (i >= 0 && i < total) setIndex(i);
  }

  function restart() {
    clearAnswers();
    setAnswers([]);
    setIndex(0);
  }

  // Keyboard: 1–5 picks an emoji, ← / → navigates.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const SCORES = [1, 2, 4, 6, 7];
      if (e.key >= "1" && e.key <= "5") {
        pickScore(SCORES[Number(e.key) - 1]);
      } else if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, question?.id]);

  if (!hydrated) {
    return <p className="text-ink/40">Laster …</p>;
  }
  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="pill bg-white/70 px-3 py-1 text-xs uppercase tracking-wider text-ink/65 ring-1 ring-black/5 backdrop-blur">
          {question.topic}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink/45 tabular-nums">
            {answeredCount}/{total} svart
          </span>
          <span className="pill bg-white/70 px-3 py-1 text-sm font-medium tabular-nums text-ink/75 ring-1 ring-black/5">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-sky-500"
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.98 }}
          transition={{ duration: 0.36, ease: [0.2, 0.6, 0.2, 1] }}
        >
          <GlassCard strong className="space-y-7">
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink/50">{question.axis}</p>
              <h1 className="font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">
                {question.statement}
              </h1>
            </div>

            <EmojiScale value={score} onChange={pickScore} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ImportancePicker value={importance} onChange={pickImportance} />
            </div>
            <ArgumentReveal question={question} quiz={quiz} />
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="pill bg-white/60 px-4 py-2 text-sm font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur transition disabled:opacity-40 enabled:hover:bg-white/80"
          >
            ← Forrige
          </button>
          <button
            type="button"
            onClick={next}
            className="pill bg-white/60 px-4 py-2 text-sm font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur transition hover:bg-white/80"
          >
            {score === null ? "Hopp over" : "Neste"} →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="text-sm text-ink/50 underline-offset-4 hover:underline"
          >
            Start på nytt
          </button>
          {answeredCount > 0 && (
            <Link
              href="/results"
              className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-transform hover:-translate-y-0.5"
            >
              Se resultater →
            </Link>
          )}
        </div>
      </div>

      {/* Question dots — clickable navigation across the deck */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        {quiz.questions.map((q, i) => {
          const answered = answersById.has(q.id);
          const here = i === index;
          return (
            <button
              key={q.id}
              type="button"
              aria-label={`Spørsmål ${i + 1}`}
              onClick={() => jumpTo(i)}
              className={clsx(
                "h-2.5 rounded-full transition-all",
                here ? "w-7 bg-ink" : answered ? "w-2.5 bg-ink/55" : "w-2.5 bg-ink/15"
              )}
            />
          );
        })}
      </div>

      <p className="text-xs text-ink/45">
        Trykk <kbd className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] ring-1 ring-black/10">1</kbd>–<kbd className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] ring-1 ring-black/10">5</kbd> for å velge,
        <kbd className="ml-1 rounded bg-white/70 px-1.5 py-0.5 text-[11px] ring-1 ring-black/10">←</kbd>/<kbd className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] ring-1 ring-black/10">→</kbd> for å bla. Svarene lagres bare i nettleseren din.{" "}
        <Link href="/om" className="underline-offset-2 hover:underline">Slik virker matchingen</Link>
      </p>
    </div>
  );
}
