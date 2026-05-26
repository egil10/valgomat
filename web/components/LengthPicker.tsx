"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Zap } from "lucide-react";

import { LENGTH_OPTIONS, type QuizLength, loadPrefs, savePrefs, resolveLength } from "@/lib/prefs";
import { clearAnswers } from "@/lib/store";
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
  }

  const total = resolveLength(length, quiz.questions.length);

  return (
    <div className="glass-strong rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Velg lengde
        </p>
        <Link
          href="/quiz"
          className="text-[11px] uppercase tracking-[0.18em] text-ink/45 underline-offset-2 hover:text-ink hover:underline"
        >
          Fortsett der jeg slapp →
        </Link>
      </div>

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
        className="group mt-5 flex w-full items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-ink via-ink to-emerald-700 px-6 py-5 text-white shadow-button transition-colors hover:from-ink hover:via-emerald-800 hover:to-emerald-600 sm:px-8 sm:py-6"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Zap size={18} aria-hidden className="text-amber-300" />
          </span>
          <span className="flex flex-col items-start">
            <span className="font-display text-2xl font-medium leading-none tracking-tight sm:text-3xl">
              Start quiz
            </span>
            <span className="mt-1 text-xs uppercase tracking-[0.18em] text-white/65">
              {total} påstander · klikk for å begynne
            </span>
          </span>
        </span>
        <ArrowRight size={28} aria-hidden className="shrink-0 text-white" />
      </Link>
    </div>
  );
}
