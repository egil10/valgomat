"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import { ArgumentReveal } from "@/components/ArgumentReveal";
import { EmojiScale } from "@/components/EmojiScale";
import { FeedbackSlide } from "@/components/FeedbackSlide";
import { GlassCard } from "@/components/GlassCard";
import { ImportancePicker } from "@/components/ImportancePicker";
import { quiz } from "@/lib/data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/store";
import type { UserAnswer } from "@/lib/types";

type Phase = "q" | "f";

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("q");
  const [hydrated, setHydrated] = useState(false);

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
  const progress = ((index + (phase === "f" ? 1 : 0)) / total) * 100;

  const upsert = useCallback((next: Partial<UserAnswer> & { questionId: string }) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === next.questionId);
      const merged: UserAnswer = {
        questionId: next.questionId,
        score: next.score ?? existing?.score ?? 4,
        importance: next.importance ?? existing?.importance ?? 2,
      };
      const updated = [...prev.filter((a) => a.questionId !== next.questionId), merged];
      saveAnswers(updated);
      return updated;
    });
  }, []);

  function pickScore(s: number) {
    upsert({ questionId: question.id, score: s });
    setTimeout(() => setPhase("f"), 360);
  }

  function pickImportance(i: number) {
    upsert({ questionId: question.id, importance: i });
  }

  function advance() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPhase("q");
    } else {
      router.push("/results");
    }
  }

  function prev() {
    if (phase === "f") {
      setPhase("q");
    } else if (index > 0) {
      setIndex(index - 1);
      setPhase(answersById.has(quiz.questions[index - 1].id) ? "f" : "q");
    }
  }

  function jumpTo(i: number) {
    if (i >= 0 && i < total) {
      setIndex(i);
      setPhase("q");
    }
  }

  function restart() {
    clearAnswers();
    setAnswers([]);
    setIndex(0);
    setPhase("q");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const SCORES = [1, 2, 4, 6, 7];
      if (phase === "q" && e.key >= "1" && e.key <= "5") {
        pickScore(SCORES[Number(e.key) - 1]);
      } else if (e.key === "ArrowRight" || (phase === "f" && (e.key === "Enter" || e.key === " "))) {
        e.preventDefault();
        if (phase === "f") advance();
        else if (score !== null) setPhase("f");
        else advance();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, question?.id, phase, score]);

  if (!hydrated) return <p className="text-ink/40">Laster …</p>;
  if (!question) return null;

  const showFeedback = phase === "f" && current;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-ink/55">
        <span>{question.topic}</span>
        <span className="tabular-nums">{index + 1} / {total}</span>
      </div>

      <div className="h-px w-full bg-black/[0.08]">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
          className="h-px bg-ink"
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {showFeedback ? (
          <motion.div
            key={`f-${question.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.2, 0.6, 0.2, 1] }}
          >
            <FeedbackSlide
              quiz={quiz}
              question={question}
              answer={current!}
              step={index + 1}
              total={total}
              onNext={advance}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`q-${question.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.2, 0.6, 0.2, 1] }}
          >
            <GlassCard strong className="space-y-7">
              <h1 className="font-display text-3xl font-medium leading-snug text-balance sm:text-4xl">
                {question.statement}
              </h1>
              <EmojiScale value={score} onChange={pickScore} />
              <ImportancePicker value={importance} onChange={pickImportance} />
              <ArgumentReveal question={question} quiz={quiz} />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0 && phase === "q"}
          className="text-ink/55 transition disabled:opacity-30 enabled:hover:text-ink"
        >
          ← Tilbake
        </button>
        <div className="flex items-center gap-4 text-xs text-ink/45">
          <button type="button" onClick={restart} className="underline-offset-2 hover:text-ink/80 hover:underline">
            Start på nytt
          </button>
          {answers.length > 0 && (
            <Link href="/results" className="underline-offset-2 hover:text-ink/80 hover:underline">
              Resultater →
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 pt-1">
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
                "h-1.5 rounded-full transition-all",
                here ? "w-5 bg-ink" : answered ? "w-1.5 bg-ink/55" : "w-1.5 bg-ink/15"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
