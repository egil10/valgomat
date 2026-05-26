"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Zap } from "lucide-react";

import { LENGTH_OPTIONS, type QuizLength, loadPrefs, savePrefs, resolveLength } from "@/lib/prefs";
import { clearAnswers, saveOrder, shuffle } from "@/lib/store";
import { quiz } from "@/lib/data";

const ITEMS: Array<{ value: QuizLength; label: string; sub: string }> = [
  { value: 10,    label: "10",   sub: "~2 min"  },
  { value: 25,    label: "25",   sub: "~5 min"  },
  { value: 50,    label: "50",   sub: "~10 min" },
  { value: 100,   label: "100",  sub: "~20 min" },
  { value: "all", label: "Alle", sub: `${quiz.questions.length}` },
];

/**
 * Hero call-to-action. Length picker is a small chip row above a single
 * giant gradient pill — the visual weight is on the start button, not the
 * picker, so there's never any doubt where to click.
 */
export function LengthPicker() {
  const [length, setLength] = useState<QuizLength>(25);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLength(loadPrefs().length);
    setHydrated(true);
  }, []);

  function pick(v: QuizLength) {
    setLength(v);
    savePrefs({ length: v });
  }

  function startFresh() {
    clearAnswers();
    const ids = quiz.questions.map((q) => q.id);
    shuffle(ids);
    const n = resolveLength(length, quiz.questions.length);
    saveOrder(ids.slice(0, n));
  }

  const total = resolveLength(length, quiz.questions.length);

  return (
    <div className="glass-strong rounded-3xl p-5 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
        Velg lengde
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ITEMS.map((opt) => {
          const active = hydrated && length === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => pick(opt.value)}
              className={clsx(
                "pill inline-flex items-baseline gap-1.5 border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-black/[0.06] bg-white/55 text-ink/75 hover:bg-white/85"
              )}
            >
              <span className="tabular-nums">{opt.label}</span>
              <span className={clsx(
                "text-[10px] uppercase tracking-[0.14em]",
                active ? "text-white/70" : "text-ink/45"
              )}>
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>

      <Link
        href="/quiz"
        onClick={startFresh}
        className="group relative mt-5 flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/40 px-6 py-5 text-ink shadow-button sm:px-8 sm:py-6"
      >
        {/* Soft pastel base — cream poster paper */}
        <span aria-hidden className="absolute inset-0 -z-10 bg-[#FBF7EF]" />
        {/* Party-rainbow at low opacity so the colors are visible but
            the surface stays light enough for dark text */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "linear-gradient(90deg," +
              " rgba(181, 18, 27, 0.30) 0%," +
              " rgba(200, 16, 46, 0.28) 12%," +
              " rgba(232, 17, 45, 0.26) 22%," +
              " rgba(20, 119, 61, 0.32) 38%," +
              " rgba(61, 140, 64, 0.30) 50%," +
              " rgba(240, 179, 35, 0.40) 62%," +
              " rgba(0, 102, 102, 0.28) 74%," +
              " rgba(0, 101, 241, 0.28) 86%," +
              " rgba(0, 90, 169, 0.30) 100%)",
          }}
        />
        {/* Inner glow shimmer on hover */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 200% at 50% -20%, rgba(255,255,255,0.85), transparent 60%)",
          }}
        />
        <span className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-amber-300 shadow-button">
            <Zap size={18} aria-hidden />
          </span>
          <span className="flex flex-col items-start">
            <span className="font-display text-2xl font-medium leading-none tracking-tight sm:text-3xl">
              Start valgomaten
            </span>
            <span className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/55">
              {total} påstander · alltid fra null
            </span>
          </span>
        </span>
        <ArrowRight size={28} aria-hidden className="shrink-0 text-ink" />
      </Link>
    </div>
  );
}
