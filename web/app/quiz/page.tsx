"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

import { BestMatchCallout } from "@/components/BestMatchCallout";
import { EmojiScale } from "@/components/EmojiScale";
import { FeedbackPanel } from "@/components/FeedbackSlide";
import { ImportancePicker } from "@/components/ImportancePicker";
import { LiveStandings } from "@/components/LiveStandings";
import { PartyStack } from "@/components/PartyStack";
import { SegmentedProgress } from "@/components/SegmentedProgress";
import { quiz } from "@/lib/data";
import { clearAnswers, loadAnswers, saveAnswers } from "@/lib/store";
import { loadPrefs, resolveLength, type QuizLength } from "@/lib/prefs";
import { PREFS_CHANGED, QUIZ_RESET } from "@/lib/quizSignals";
import type { AutoMode } from "@/components/AutoAdvance";
import type { UserAnswer } from "@/lib/types";

const SKIP_CAP = 3;

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [autoMode, setAutoMode] = useState<AutoMode>("manual");
  const [length, setLength] = useState<QuizLength>(25);
  const [showQuotes, setShowQuotes] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slice the pool based on chosen length. This keeps memoization stable.
  const pool = useMemo(() => {
    const n = resolveLength(length, quiz.questions.length);
    return quiz.questions.slice(0, n);
  }, [length]);
  const total = pool.length;

  // Hydrate from localStorage once on mount, and rehydrate on signal events.
  const hydrate = useCallback(() => {
    const saved = loadAnswers();
    const prefs = loadPrefs();
    setAutoMode(prefs.autoAdvance);
    setLength(prefs.length);

    const n = resolveLength(prefs.length, quiz.questions.length);
    const activeIds = new Set(quiz.questions.slice(0, n).map((q) => q.id));
    const relevant = saved.filter((a) => activeIds.has(a.questionId));
    setAnswers(relevant);

    if (relevant.length > 0 && relevant.length < n) {
      const firstUnanswered = quiz.questions
        .slice(0, n)
        .findIndex((q) => !relevant.some((a) => a.questionId === q.id));
      if (firstUnanswered !== -1) setIndex(firstUnanswered);
      else setIndex(0);
    } else {
      setIndex(0);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    hydrate();
    function onReset() {
      setSkipped(new Set());
      setShowQuotes(false);
      hydrate();
    }
    function onPrefs() {
      hydrate();
    }
    window.addEventListener(QUIZ_RESET, onReset);
    window.addEventListener(PREFS_CHANGED, onPrefs);
    return () => {
      window.removeEventListener(QUIZ_RESET, onReset);
      window.removeEventListener(PREFS_CHANGED, onPrefs);
    };
  }, [hydrate]);

  const question = pool[Math.min(index, total - 1)];
  const answersById = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a])),
    [answers]
  );
  const current = question ? answersById.get(question.id) : undefined;
  const score = current?.score ?? null;
  const importance = current?.importance ?? 2;
  const skipsLeft = SKIP_CAP - skipped.size;

  // Indices of pool questions that have an answer — for SegmentedProgress.
  const answeredIndices = useMemo(() => {
    const s = new Set<number>();
    pool.forEach((q, i) => {
      if (answersById.has(q.id)) s.add(i);
    });
    return s;
  }, [pool, answersById]);

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
      // Save the full union back to localStorage (don't drop other lengths' answers).
      const onDisk = loadAnswers();
      const others = onDisk.filter((a) => a.questionId !== next.questionId);
      saveAnswers([...others, merged]);
      // Local component state only carries answers for the active pool.
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
    if (!question) return;
    clearAutoTimer();
    upsert({ questionId: question.id, score: s });
  }
  function pickImportance(i: number) {
    if (!question) return;
    upsert({ questionId: question.id, importance: i });
  }

  function goToNext() {
    if (index + 1 < total) setIndex(index + 1);
    else router.push("/results");
  }

  function advance() {
    if (!question) return;
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
      if (e.key >= "1" && e.key <= "7") {
        pickScore(Number(e.key));
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
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Live standings — always rendered for stable layout */}
      <LiveStandings quiz={quiz} answers={answers} />

      {/* Topic + segmented progress + nav */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          {question.topic}
        </p>
        <SegmentedProgress total={total} answered={answeredIndices} index={index} />
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label="Forrige påstand"
            className="pill inline-flex h-9 items-center gap-1 border border-black/[0.06] bg-white/70 px-3 text-sm text-ink/75 transition-colors enabled:hover:bg-white enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={15} aria-hidden />
            <span className="hidden sm:inline">Tilbake</span>
          </button>
          <button
            type="button"
            onClick={advance}
            disabled={!current && skipsLeft <= 0}
            className={
              current
                ? "pill inline-flex h-9 items-center gap-1.5 bg-ink px-5 text-sm font-medium text-white shadow-button transition-colors enabled:hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
                : "pill inline-flex h-9 items-center gap-1.5 border border-black/[0.06] bg-white/70 px-4 text-sm font-medium text-ink/75 transition-colors enabled:hover:bg-white enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            {current ? (
              <>
                <span>{index + 1 === total ? "Se resultater" : "Neste"}</span>
                <ChevronRight size={15} aria-hidden />
              </>
            ) : (
              <>
                <SkipForward size={13} aria-hidden />
                <span>Hopp over</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Counter row — same numbers shown every render so the line never jumps */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tabular-nums text-ink/55">
        <span><strong className="font-medium text-ink/85">{answers.length}</strong> svart</span>
        <span className="text-ink/30">·</span>
        <span><strong className="font-medium text-ink/85">{skipped.size}</strong> hoppet over</span>
        <span className="text-ink/30">·</span>
        <span><strong className="font-medium text-ink/85">{Math.max(0, total - answers.length - skipped.size)}</strong> igjen</span>
        <span className="text-ink/30">·</span>
        <span><strong className="font-medium text-ink/85">{skipsLeft}</strong> hopp tilgjengelig</span>
        <span className="ml-auto text-ink/40">Spørsmål {index + 1} av {total}</span>
      </div>

      {/* Combined card — fixed-feeling height */}
      <section
        className="glass-strong rounded-3xl p-5 sm:p-6"
        aria-label="Påstand"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
            {question.axis}
          </p>
          <ImportancePicker value={importance} onChange={pickImportance} />
        </div>

        <h1 className="mt-3 min-h-[3.5em] font-display text-2xl font-medium leading-snug text-balance sm:min-h-[2.6em] sm:text-3xl">
          {question.statement}
        </h1>

        <div className="mt-4">
          <EmojiScale value={score} onChange={pickScore} />
        </div>

        <div className="mt-2">
          <PartyStack quiz={quiz} question={question} userScore={score} />
        </div>
        <div className="mt-1 flex justify-between px-1 text-[10px] uppercase tracking-[0.18em] text-ink/40">
          <span>Helt uenig</span>
          <span>Tja</span>
          <span>Helt enig</span>
        </div>
      </section>

      {/* Always-rendered best-match callout — keeps height stable */}
      <BestMatchCallout quiz={quiz} question={question} answer={current} />

      {/* Toggle + nav links row */}
      <div className="flex items-center justify-between text-xs text-ink/55">
        <button
          type="button"
          onClick={() => setShowQuotes((v) => !v)}
          disabled={!current}
          className="underline-offset-2 enabled:hover:text-ink enabled:hover:underline disabled:opacity-40"
        >
          {showQuotes ? "Skjul alle sitater ↑" : "Vis alle 9 sitater ↓"}
        </button>
        <div className="flex gap-3">
          {answers.length > 0 && (
            <Link href="/results" className="underline-offset-2 hover:text-ink hover:underline">
              Resultater så langt →
            </Link>
          )}
          <Link href="/kilder" className="underline-offset-2 hover:text-ink hover:underline">
            Alle kilder
          </Link>
        </div>
      </div>

      {current && showQuotes && (
        <FeedbackPanel quiz={quiz} question={question} answer={current} />
      )}
    </div>
  );
}
