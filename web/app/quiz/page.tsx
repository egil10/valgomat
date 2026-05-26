"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { ImportancePicker } from "@/components/ImportancePicker";
import { LikertScale } from "@/components/LikertScale";
import { quiz } from "@/lib/data";
import { loadAnswers, saveAnswers, clearAnswers } from "@/lib/store";
import type { UserAnswer } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [importance, setImportance] = useState<number>(2);

  // Restore in-progress quiz on mount
  useEffect(() => {
    const saved = loadAnswers();
    setAnswers(saved);
    if (saved.length > 0 && saved.length < quiz.questions.length) {
      setIndex(saved.length);
    }
  }, []);

  const question = quiz.questions[index];
  const total = quiz.questions.length;
  const progress = useMemo(() => ((index + 1) / total) * 100, [index, total]);

  function commit(next: number, nextImportance: number) {
    const updated = [
      ...answers.filter((a) => a.questionId !== question.id),
      {
        questionId: question.id,
        score: next,
        importance: nextImportance,
      },
    ];
    setAnswers(updated);
    saveAnswers(updated);
  }

  function handleNext() {
    if (score === null) return;
    commit(score, importance);
    setScore(null);
    setImportance(2);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      router.push("/results");
    }
  }

  function handleSkip() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setScore(null);
      setImportance(2);
    } else {
      router.push("/results");
    }
  }

  function handlePrev() {
    if (index > 0) {
      setIndex(index - 1);
      const prev = answers.find((a) => a.questionId === quiz.questions[index - 1].id);
      setScore(prev?.score ?? null);
      setImportance(prev?.importance ?? 2);
    }
  }

  function handleRestart() {
    clearAnswers();
    setAnswers([]);
    setIndex(0);
    setScore(null);
    setImportance(2);
  }

  // Hydrate score/importance when navigating to an already-answered question
  useEffect(() => {
    const existing = answers.find((a) => a.questionId === question?.id);
    setScore(existing?.score ?? null);
    setImportance(existing?.importance ?? 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="pill bg-white/60 px-3 py-1 text-xs uppercase tracking-wider text-ink/60 ring-1 ring-black/5 backdrop-blur">
          {question.topic}
        </span>
        <span className="font-medium tabular-nums text-ink/55">
          {index + 1} / {total}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-sky-500"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.32, ease: [0.2, 0.6, 0.2, 1] }}
        >
          <GlassCard strong className="space-y-6">
            <p className="text-xs uppercase tracking-wider text-ink/50">{question.axis}</p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">
              {question.statement}
            </h1>

            <LikertScale value={score} onChange={setScore} />
            <ImportancePicker value={importance} onChange={setImportance} />
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="pill bg-white/60 px-4 py-2 text-sm font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur transition disabled:opacity-40 enabled:hover:bg-white/80"
          >
            ← Forrige
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="pill bg-white/60 px-4 py-2 text-sm font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur transition hover:bg-white/80"
          >
            Hopp over
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="text-sm text-ink/50 underline-offset-4 hover:underline"
          >
            Start på nytt
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={score === null}
            className="pill inline-flex items-center gap-2 bg-ink px-6 py-3 text-base font-semibold text-white shadow-button transition-transform disabled:opacity-30 enabled:hover:-translate-y-0.5"
          >
            {index + 1 === total ? "Se resultater" : "Neste"} <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-ink/45">
        Svarene lagres bare i nettleseren din ({answers.length} av {total} så langt).{" "}
        <Link href="/om" className="underline-offset-2 hover:underline">
          Slik virker matchingen
        </Link>
      </p>
    </div>
  );
}
