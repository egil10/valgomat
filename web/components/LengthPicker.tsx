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
        className="group relative mt-5 flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl px-6 py-5 text-white shadow-button sm:px-8 sm:py-6"
      >
        {/* Party-rainbow base (left-right political spectrum, muted) */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(90deg, #B5121B 0%, #C8102E 12%, #E8112D 22%, #14773D 38%, #3D8C40 50%, #F0B323 62%, #006666 74%, #0065F1 86%, #005AA9 100%)",
          }}
        />
        {/* Dark wash so the colors read as "muted poster", not garish */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-ink/[0.78] mix-blend-multiply"
        />
        {/* Subtle highlight on hover */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 100%)",
          }}
        />
        <span className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Zap size={18} aria-hidden className="text-amber-300" />
          </span>
          <span className="flex flex-col items-start">
            <span className="font-display text-2xl font-medium leading-none tracking-tight sm:text-3xl">
              Start valgomaten
            </span>
            <span className="mt-1 text-xs uppercase tracking-[0.18em] text-white/70">
              {total} påstander · alltid fra null
            </span>
          </span>
        </span>
        <ArrowRight size={28} aria-hidden className="shrink-0 text-white" />
      </Link>
    </div>
  );
}
