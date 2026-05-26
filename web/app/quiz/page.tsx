"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import { ArgumentReveal } from "@/components/ArgumentReveal";
import { EmojiScale } from "@/components/EmojiScale";
import { FeedbackPanel } from "@/components/FeedbackSlide";
import { ImportancePicker } from "@/components/ImportancePicker";
import { quiz } from "@/lib/data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/store";
import type { UserAnswer } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
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
  const progress = ((index + (current ? 1 : 0)) / total) * 100;

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
  }
  function pickImportance(i: number) {
    upsert({ questionId: question.id, importance: i });
  }
  function advance() {
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
    if (typeof window !== "undefined" && answers.length > 0) {
      if (!window.confirm("Nullstille alle svar?")) return;
    }
    clearAnswers();
    setAnswers([]);
    setIndex(0);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const SCORES = [1, 2, 4, 6, 7];
      if (e.key >= "1" && e.key <= "5") {
        pickScore(SCORES[Number(e.key) - 1]);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, question?.id]);

  if (!hydrated) return <p className="text-ink/40">Laster …</p>;
  if (!question) return null;

  return (
    <div className="space-y-5">
      {/* Top bar: topic + counter + reset */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em]">
        <span className="text-ink/55">{question.topic}</span>
        <span className="text-ink/30">·</span>
        <span className="tabular-nums text-ink/55">{index + 1} / {total}</span>
        <span className="text-ink/30">·</span>
        <span className="tabular-nums text-ink/40">{answers.length} svart</span>
        <button
          type="button"
          onClick={restart}
          className="ml-auto text-ink/55 underline-offset-2 hover:text-rose-700 hover:underline"
        >
          Nullstill
        </button>
      </div>

      {/* Progress rule */}
      <div className="h-px w-full bg-black/[0.08]">
        <div
          className="h-px bg-ink transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dual-pane: question + answer left, party reveal right */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT: question + emoji + importance */}
        <section
          className="glass-strong flex min-h-[460px] flex-col gap-5 rounded-3xl p-6 sm:min-h-[480px] sm:p-7"
          aria-label="Påstand"
        >
          <h1 className="font-display text-2xl font-medium leading-snug text-balance sm:text-3xl">
            {question.statement}
          </h1>
          <EmojiScale value={score} onChange={pickScore} />
          <div className="mt-auto space-y-3">
            <ImportancePicker value={importance} onChange={pickImportance} />
            <ArgumentReveal question={question} quiz={quiz} />
          </div>
        </section>

        {/* RIGHT: live party reveal */}
        <section
          className="glass flex min-h-[460px] flex-col rounded-3xl p-6 sm:min-h-[480px] sm:p-7"
          aria-label="Partienes posisjoner"
        >
          <FeedbackPanel quiz={quiz} question={question} answer={current} />
        </section>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between gap-3 pt-1 text-sm">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="text-ink/55 transition disabled:opacity-30 enabled:hover:text-ink"
        >
          ← Tilbake
        </button>
        <div className="flex items-center gap-4">
          {answers.length > 0 && (
            <Link
              href="/results"
              className="text-xs text-ink/55 underline-offset-2 hover:text-ink hover:underline"
            >
              Resultater
            </Link>
          )}
          <button
            type="button"
            onClick={advance}
            className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-button transition-transform hover:-translate-y-0.5"
          >
            {index + 1 === total ? "Resultater" : "Neste"} →
          </button>
        </div>
      </div>

      {/* Dot deck */}
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
