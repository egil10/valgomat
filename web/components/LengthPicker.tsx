"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

import { LENGTH_OPTIONS, type QuizLength, loadPrefs, savePrefs, resolveLength } from "@/lib/prefs";
import { clearAnswers } from "@/lib/store";
import { quiz } from "@/lib/data";

const ITEMS: Array<{ value: QuizLength; label: string; sub: string }> = [
  { value: 10,    label: "10",    sub: "smaksprøve ~2 min" },
  { value: 25,    label: "25",    sub: "rask ~5 min"        },
  { value: 50,    label: "50",    sub: "grundig ~10 min"    },
  { value: 100,   label: "100",   sub: "dyp ~20 min"        },
  { value: "all", label: "Alle",  sub: `${quiz.questions.length} påstander` },
];

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
    <div className="glass-strong rounded-3xl p-5 sm:p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
        Velg lengde
      </p>
      <p className="mt-1 max-w-prose text-sm text-ink/65">
        Korte runder gir et raskt fingeravtrykk, lange gir et nøyaktig speil.
        Du kan endre underveis.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ITEMS.map((opt) => {
          const active = hydrated && length === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => pick(opt.value)}
              className={clsx(
                "group flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-black/[0.06] bg-white/55 text-ink hover:bg-white/85"
              )}
            >
              <span className="font-display text-2xl font-medium tabular-nums">
                {opt.label}
              </span>
              <span className={clsx(
                "text-[11px] uppercase tracking-[0.16em]",
                active ? "text-white/75" : "text-ink/50"
              )}>
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/quiz"
          onClick={startFresh}
          className="pill inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm font-medium text-white shadow-button transition-transform hover:-translate-y-0.5"
        >
          Start {total} påstander
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/quiz"
          className="pill inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-ink/65 hover:text-ink"
        >
          Fortsett der jeg slapp
        </Link>
        <Link
          href="/om"
          className="ml-auto text-xs text-ink/55 underline-offset-2 hover:text-ink hover:underline"
        >
          Metode →
        </Link>
      </div>
    </div>
  );
}
