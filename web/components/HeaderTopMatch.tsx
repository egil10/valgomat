"use client";

import { useEffect, useState } from "react";

import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import { matchParties } from "@/lib/match";
import { loadAnswers } from "@/lib/store";
import { PREFS_CHANGED, QUIZ_RESET } from "@/lib/quizSignals";
import type { UserAnswer } from "@/lib/types";

/**
 * Compact "your current top match" chip that lives in the global PillHeader
 * during the quiz. Listens for the same reset/prefs signals the QuizPage
 * uses, so the chip refreshes when answers change. Stays empty until the
 * user has actually answered something.
 */
export function HeaderTopMatch() {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAnswers(loadAnswers());
    setHydrated(true);

    function refresh() {
      setAnswers(loadAnswers());
    }
    window.addEventListener(QUIZ_RESET, refresh);
    window.addEventListener(PREFS_CHANGED, refresh);
    // localStorage doesn't fire in the same tab; we expose a custom event below.
    window.addEventListener("valgomat:answers", refresh);
    return () => {
      window.removeEventListener(QUIZ_RESET, refresh);
      window.removeEventListener(PREFS_CHANGED, refresh);
      window.removeEventListener("valgomat:answers", refresh);
    };
  }, []);

  if (!hydrated || answers.length === 0) return null;
  const ranked = matchParties(quiz, answers);
  if (ranked.length === 0) return null;
  const top = ranked[0];

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/70 pl-1 pr-2 py-1 text-[11px] md:inline-flex"
      title={`Du ligger nærmest ${top.party.name} (${top.percent.toFixed(0)} %) etter ${answers.length} svar`}
    >
      <PartyLogo party={top.party} size={20} ring={false} />
      <span className="font-medium text-ink/85">{top.party.abbr}</span>
      <span className="tabular-nums text-ink/55">{top.percent.toFixed(0)}%</span>
    </span>
  );
}
