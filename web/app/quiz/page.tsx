"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

import { BestMatchCallout } from "@/components/BestMatchCallout";
import { EmojiScale } from "@/components/EmojiScale";
import { FeedbackPanel } from "@/components/FeedbackSlide";
import { ImportancePicker } from "@/components/ImportancePicker";
import { PartyStack } from "@/components/PartyStack";
import { SegmentedProgress } from "@/components/SegmentedProgress";
import { StandingsShowButton, StandingsSidebar } from "@/components/StandingsSidebar";
import { quiz, getQuestionById } from "@/lib/data";
import {
  loadAnswers,
  loadOrder,
  saveAnswers,
  saveOrder,
  shuffle,
} from "@/lib/store";
import { loadPrefs, resolveLength, savePrefs, type QuizLength } from "@/lib/prefs";
import {
  ANSWERS_CHANGED,
  PREFS_CHANGED,
  QUIZ_RESET,
  emitAnswersChanged,
} from "@/lib/quizSignals";
import type { AutoMode } from "@/components/AutoAdvance";
import type { Question, UserAnswer } from "@/lib/types";

const SKIP_CAP = 3;

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [autoMode, setAutoMode] = useState<AutoMode>("manual");
  const [length, setLength] = useState<QuizLength>(25);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [showQuotes, setShowQuotes] = useState(false);
  const [showStandings, setShowStandings] = useState(true);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Resolved pool of question objects, in the shuffled order. */
  const pool: Question[] = useMemo(() => {
    const wanted = resolveLength(length, quiz.questions.length);
    const ids = orderIds.length > 0 ? orderIds : quiz.questions.map((q) => q.id);
    const resolved: Question[] = [];
    for (const id of ids) {
      const q = getQuestionById(id);
      if (q) resolved.push(q);
      if (resolved.length >= wanted) break;
    }
    return resolved;
  }, [orderIds, length]);
  const total = pool.length;

  const hydrate = useCallback(() => {
    const saved = loadAnswers();
    const prefs = loadPrefs();
    setAutoMode(prefs.autoAdvance);
    setLength(prefs.length);
    setShowStandings(prefs.showStandings);

    let order = loadOrder();
    if (order.length === 0) {
      // No shuffle yet (user navigated to /quiz directly). Generate one
      // and save so reloads stay consistent inside this game.
      order = quiz.questions.map((q) => q.id);
      shuffle(order);
      const n = resolveLength(prefs.length, quiz.questions.length);
      order = order.slice(0, n);
      saveOrder(order);
    }
    setOrderIds(order);

    const activeIds = new Set(order);
    const relevant = saved.filter((a) => activeIds.has(a.questionId));
    setAnswers(relevant);

    if (relevant.length > 0 && relevant.length < order.length) {
      const firstUnanswered = order.findIndex(
        (id) => !relevant.some((a) => a.questionId === id)
      );
      setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
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

  const question = pool[Math.min(index, Math.max(0, total - 1))];
  const answersById = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a])),
    [answers]
  );
  const current = question ? answersById.get(question.id) : undefined;
  const score = current?.score ?? null;
  const importance = current?.importance ?? 2;
  const skipsLeft = SKIP_CAP - skipped.size;

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
      const onDisk = loadAnswers();
      const others = onDisk.filter((a) => a.questionId !== next.questionId);
      saveAnswers([...others, merged]);
      emitAnswersChanged();
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

  function toggleStandings(v: boolean) {
    setShowStandings(v);
    savePrefs({ showStandings: v });
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

  // Keep header chip in sync if other tabs change state.
  useEffect(() => {
    function refresh() {
      const saved = loadAnswers();
      const order = loadOrder();
      const allowed = new Set(order);
      setAnswers(order.length === 0 ? saved : saved.filter((a) => allowed.has(a.questionId)));
    }
    window.addEventListener(ANSWERS_CHANGED, refresh);
    return () => window.removeEventListener(ANSWERS_CHANGED, refresh);
  }, []);

  if (!hydrated) return <p className="text-ink/40">Laster …</p>;
  if (!question) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-ink/55">Ingen aktiv valgomat. Start fra forsiden.</p>
        <Link href="/" className="pill inline-flex items-center gap-2 bg-ink px-5 py-2 text-sm font-medium text-white">
          Til forsiden →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Single condensed control row with fixed columns so it never shifts
          when the topic / counts change width. */}
      <div className="grid grid-cols-[180px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[180px_minmax(0,1fr)_220px_auto]">
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink/55">
          {question.topic}
        </p>
        <SegmentedProgress total={total} answered={answeredIndices} />
        <div className="hidden items-center justify-end gap-x-2 whitespace-nowrap text-[11px] tabular-nums text-ink/55 sm:flex">
          <span><strong className="font-medium text-ink/85">{answers.length}</strong> svart</span>
          <span className="text-ink/30">·</span>
          <span><strong className="font-medium text-ink/85">{skipped.size}</strong> hoppet</span>
          <span className="text-ink/30">·</span>
          <span><strong className="font-medium text-ink/85">{skipsLeft}</strong> hopp igjen</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
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
              "pill inline-flex h-9 w-[140px] items-center justify-center gap-1.5 text-sm font-medium shadow-button transition-colors disabled:cursor-not-allowed disabled:opacity-40 " +
              (current
                ? "bg-ink text-white enabled:hover:bg-ink/90"
                : "border border-black/[0.06] bg-white/70 text-ink/75 enabled:hover:bg-white enabled:hover:text-ink")
            }
          >
            {current ? (
              <>
                <span>{index + 1 === total ? "Resultater" : "Neste"}</span>
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

      {/* Main card + standings sidebar */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section
          className="glass-strong flex min-h-[500px] flex-col rounded-3xl p-5 sm:min-h-[540px] sm:p-6"
          aria-label="Påstand"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">
              {question.axis}
            </p>
            <ImportancePicker value={importance} onChange={pickImportance} />
          </div>

          <h1 className="mt-3 line-clamp-3 min-h-[4.4em] font-display text-2xl font-medium leading-snug text-balance sm:min-h-[4em] sm:text-3xl">
            {question.statement}
          </h1>

          <div className="mt-4 flex justify-between px-1 text-[10px] uppercase tracking-[0.18em] text-ink/45">
            <span>Helt uenig</span>
            <span>Tja</span>
            <span>Helt enig</span>
          </div>

          <div className="mt-1.5">
            <EmojiScale value={score} onChange={pickScore} />
          </div>

          <div className="mt-2">
            <PartyStack quiz={quiz} question={question} userScore={score} />
          </div>
        </section>

        <div className={showStandings ? "lg:w-[240px]" : "lg:w-9"}>
          {showStandings ? (
            <StandingsSidebar
              quiz={quiz}
              answers={answers}
              onHide={() => toggleStandings(false)}
            />
          ) : (
            <StandingsShowButton onShow={() => toggleStandings(true)} />
          )}
        </div>
      </div>

      <BestMatchCallout quiz={quiz} question={question} answer={current} />

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
