"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { AutoAdvanceToggle, type AutoMode } from "@/components/AutoAdvance";
import { EmojiScale } from "@/components/EmojiScale";
import { FeedbackPanel } from "@/components/FeedbackSlide";
import { ImportancePicker } from "@/components/ImportancePicker";
import { PartySpectrum } from "@/components/PartySpectrum";
import { quiz } from "@/lib/data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/store";
import { loadPrefs, savePrefs } from "@/lib/prefs";
import type { UserAnswer } from "@/lib/types";

const SKIP_CAP = 3;

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [autoMode, setAutoMode] = useState<AutoMode>("manual");
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = loadAnswers();
    setAnswers(saved);
    const prefs = loadPrefs();
    setAutoMode(prefs.autoAdvance);
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
  const skipsLeft = SKIP_CAP - skipped.size;

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

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
    setSkipped((prev) => {
      if (!prev.has(next.questionId)) return prev;
      const copy = new Set(prev);
      copy.delete(next.questionId);
      return copy;
    });
  }, []);

  function pickScore(s: number) {
    clearAutoTimer();
    upsert({ questionId: question.id, score: s });
  }
  function pickImportance(i: number) {
    upsert({ questionId: question.id, importance: i });
  }

  function goToNext() {
    if (index + 1 < total) setIndex(index + 1);
    else router.push("/results");
  }

  function advance() {
    clearAutoTimer();
    if (!current) {
      if (!skipped.has(question.id)) {
        if (skipsLeft <= 0) {
          if (typeof window !== "undefined") {
            window.alert("Du har brukt opp alle 3 hopp over. Svar på påstanden for å gå videre.");
          }
          return;
        }
        setSkipped((prev) => new Set(prev).add(question.id));
      }
    }
    goToNext();
  }

  function prev() {
    clearAutoTimer();
    if (index > 0) setIndex(index - 1);
  }
  function jumpTo(i: number) {
    clearAutoTimer();
    if (i >= 0 && i < total) setIndex(i);
  }
  function restart() {
    if (typeof window !== "undefined" && answers.length > 0) {
      if (!window.confirm("Nullstille alle svar?")) return;
    }
    clearAutoTimer();
    clearAnswers();
    setAnswers([]);
    setSkipped(new Set());
    setIndex(0);
  }
  function setAuto(mode: AutoMode) {
    setAutoMode(mode);
    savePrefs({ autoAdvance: mode });
    if (mode === "manual") clearAutoTimer();
  }

  useEffect(() => {
    clearAutoTimer();
    if (!current || autoMode === "manual") return;
    const delayMs = Number(autoMode) * 1000;
    autoTimerRef.current = setTimeout(() => goToNext(), delayMs);
    return clearAutoTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.score, autoMode, index]);

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
  }, [index, total, question?.id, score, skipped, autoMode]);

  if (!hydrated) return <p className="text-ink/40">Laster …</p>;
  if (!question) return null;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em]">
        <span className="text-ink/55">{question.topic}</span>
        <span className="text-ink/30">·</span>
        <span className="tabular-nums text-ink/55">{index + 1} / {total}</span>
        <span className="text-ink/30">·</span>
        <span className="tabular-nums text-ink/45">{skipsLeft} hopp igjen</span>
        <div className="ml-auto flex items-center gap-3">
          <AutoAdvanceToggle value={autoMode} onChange={setAuto} />
          <button
            type="button"
            onClick={restart}
            className="text-ink/55 underline-offset-2 hover:text-rose-700 hover:underline"
          >
            Nullstill
          </button>
        </div>
      </div>

      {/* Progress + Next */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-px w-full bg-black/[0.08]">
            <div
              className="h-px bg-ink transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="text-sm text-ink/55 transition disabled:opacity-30 enabled:hover:text-ink"
          >
            ← Tilbake
          </button>
          <button
            type="button"
            onClick={advance}
            disabled={!current && skipsLeft <= 0}
            className="pill inline-flex items-center gap-2 bg-ink px-5 py-2 text-sm font-medium text-white shadow-button transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {current
              ? (index + 1 === total ? "Resultater" : "Neste")
              : "Hopp over"} →
          </button>
        </div>
      </div>

      {/* Question card — full width */}
      <section
        className="glass-strong rounded-3xl p-6 sm:p-8"
        aria-label="Påstand"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
            {question.axis}
          </p>
          <ImportancePicker value={importance} onChange={pickImportance} />
        </div>

        <h1 className="mt-5 font-display text-3xl font-medium leading-snug text-balance sm:text-4xl">
          {question.statement}
        </h1>

        <div className="mt-6">
          <EmojiScale value={score} onChange={pickScore} />
        </div>
      </section>

      {/* Spectrum — full width */}
      <PartySpectrum quiz={quiz} question={question} userScore={score} />

      {/* Party reveal — full width */}
      <FeedbackPanel quiz={quiz} question={question} answer={current} />

      {/* Footer: results link + dot deck */}
      <div className="flex items-center justify-between gap-3 pt-1 text-sm">
        {answers.length > 0 ? (
          <Link href="/results" className="text-xs text-ink/55 underline-offset-2 hover:text-ink hover:underline">
            Resultater så langt →
          </Link>
        ) : <span />}
        <Link href="/kilder" className="text-xs text-ink/55 underline-offset-2 hover:text-ink hover:underline">
          Alle kilder
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 pt-1">
        {quiz.questions.map((q, i) => {
          const answered = answersById.has(q.id);
          const wasSkipped = skipped.has(q.id);
          const here = i === index;
          return (
            <button
              key={q.id}
              type="button"
              aria-label={`Spørsmål ${i + 1}`}
              onClick={() => jumpTo(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                here ? "w-5 bg-ink"
                  : answered ? "w-1.5 bg-ink/55"
                  : wasSkipped ? "w-1.5 bg-rose-400/55"
                  : "w-1.5 bg-ink/15"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
