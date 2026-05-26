"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

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
        className="group relative mt-5 flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/60 px-7 py-6 text-ink shadow-button sm:px-9 sm:py-7"
      >
        {/* Cream paper base */}
        <span aria-hidden className="absolute inset-0 -z-10 bg-[#FBF8F0]" />
        {/* Watercolor blobs — pale party tones so the surface stays
            primarily cream with just a hint of color. */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 110% at 8% 50%, rgba(232, 17, 45, 0.14), transparent 60%)," +
              "radial-gradient(50% 110% at 32% 60%, rgba(181, 18, 27, 0.10), transparent 65%)," +
              "radial-gradient(55% 110% at 50% 40%, rgba(20, 119, 61, 0.12), transparent 65%)," +
              "radial-gradient(45% 110% at 65% 60%, rgba(240, 179, 35, 0.16), transparent 65%)," +
              "radial-gradient(55% 110% at 92% 50%, rgba(0, 101, 241, 0.13), transparent 60%)",
          }}
        />
        {/* Subtle top highlight so text stays crisp */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        {/* Brighter wash on hover */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 200% at 50% -20%, rgba(255,255,255,0.55), transparent 60%)",
          }}
        />
        <span className="flex flex-col items-start">
          <span className="font-display text-3xl font-medium leading-none tracking-tight sm:text-4xl">
            Start valgomaten
          </span>
          <span className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ink/55">
            {total} påstander · alltid fra null
          </span>
        </span>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-white/60 text-ink transition-colors group-hover:bg-white">
          <ArrowRight size={20} aria-hidden />
        </span>
      </Link>
    </div>
  );
}
