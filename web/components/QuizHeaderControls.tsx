"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Home } from "lucide-react";

import { AUTO_OPTIONS, type AutoMode } from "@/components/AutoAdvance";
import { HeaderTopMatch } from "@/components/HeaderTopMatch";
import { clearAnswers, clearOrder } from "@/lib/store";
import { loadPrefs, savePrefs } from "@/lib/prefs";
import { emitPrefsChanged, emitReset } from "@/lib/quizSignals";

export function QuizHeaderControls() {
  const router = useRouter();
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
      if (!window.confirm("Avslutte valgomaten? Du må starte på nytt fra forsiden.")) return;
    }
    clearAnswers();
    clearOrder();
    emitReset();
    router.push("/");
  }

  if (!hydrated) return <span className="hidden h-7 sm:block" />;

  return (
    <div className="flex items-center gap-2">
      <HeaderTopMatch />
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
        title="Avslutt og start på nytt fra forsiden"
        className="pill inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-ink/65 transition-colors hover:bg-white/70 hover:text-rose-700"
      >
        <Home size={12} aria-hidden />
        <span>Reset</span>
      </button>
    </div>
  );
}
