"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { RotateCcw } from "lucide-react";

import { AUTO_OPTIONS, type AutoMode } from "@/components/AutoAdvance";
import { clearAnswers } from "@/lib/store";
import { loadPrefs, savePrefs } from "@/lib/prefs";
import { emitPrefsChanged, emitReset } from "@/lib/quizSignals";

/**
 * Quiz-only controls hosted in the global PillHeader. We render here instead
 * of in-page so the quiz card itself can be tighter, and so these controls
 * stay accessible no matter how far into the quiz the user has scrolled.
 */
export function QuizHeaderControls() {
  const [autoMode, setAutoMode] = useState<AutoMode>("manual");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = loadPrefs();
    setAutoMode(p.autoAdvance);
    setHydrated(true);
  }, []);

  function changeAuto(v: AutoMode) {
    setAutoMode(v);
    savePrefs({ autoAdvance: v });
    emitPrefsChanged();
  }

  function reset() {
    if (typeof window !== "undefined") {
      if (!window.confirm("Nullstille alle svar?")) return;
    }
    clearAnswers();
    emitReset();
  }

  if (!hydrated) return <span className="hidden h-7 sm:block" />;

  return (
    <div className="flex items-center gap-2">
      <div
        className="hidden items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/55 p-0.5 md:flex"
        role="radiogroup"
        aria-label="Auto-spørsmål"
      >
        {AUTO_OPTIONS.map((o) => {
          const active = autoMode === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.value === "manual" ? "Bla manuelt" : `Auto-svar etter ${o.value} sekunder`}
              onClick={() => changeAuto(o.value)}
              className={clsx(
                "rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors duration-150",
                active ? "bg-ink text-white" : "text-ink/55 hover:text-ink/85"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={reset}
        title="Nullstille alle svar"
        className="pill inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-ink/65 hover:bg-white/70 hover:text-rose-700"
      >
        <RotateCcw size={12} aria-hidden />
        <span>Nullstill</span>
      </button>
    </div>
  );
}
