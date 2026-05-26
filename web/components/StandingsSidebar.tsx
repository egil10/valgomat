"use client";

import { PartyLogo } from "@/components/PartyLogo";
import { matchParties } from "@/lib/match";
import type { Quiz, UserAnswer } from "@/lib/types";

/**
 * Vertical companion card to the valgomat — shows the running top match
 * across all parties. Lives next to the question card on wide screens so
 * the user sees the standings update with every answer.
 */
export function StandingsSidebar({
  quiz,
  answers,
}: {
  quiz: Quiz;
  answers: UserAnswer[];
}) {
  const ranked = answers.length > 0 ? matchParties(quiz, answers) : [];

  return (
    <aside
      className="glass flex h-full flex-col rounded-3xl p-4 sm:p-5"
      aria-label="Din rangering så langt"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Din match
        </p>
        <p className="text-[10px] tabular-nums text-ink/40">
          {answers.length} svar
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="mt-4 text-sm text-ink/45">
          Svar på en påstand — så ser du rangeringen i sanntid her.
        </p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {ranked.map((m, i) => {
            const isLeader = i === 0;
            return (
              <li
                key={m.slug}
                className={
                  isLeader
                    ? "flex items-center gap-2 rounded-xl bg-white/70 px-2 py-1.5"
                    : "flex items-center gap-2 rounded-xl px-2 py-1"
                }
              >
                <span className="w-4 shrink-0 text-[11px] tabular-nums text-ink/40">
                  {i + 1}.
                </span>
                <PartyLogo party={m.party} size={isLeader ? 24 : 20} ring={false} />
                <span className={isLeader ? "font-medium text-ink" : "text-ink/85"}>
                  {m.party.abbr}
                </span>
                <span className="ml-auto tabular-nums text-[11px] text-ink/55">
                  {m.percent.toFixed(0)}%
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {ranked.length > 0 && (
        <div className="mt-3 border-t border-black/[0.05] pt-2 text-[10px] uppercase tracking-[0.18em] text-ink/40">
          Topp: <span className="text-ink/65">{ranked[0].party.name}</span>
        </div>
      )}
    </aside>
  );
}
