"use client";

import { PartyLogo } from "@/components/PartyLogo";
import { matchParties } from "@/lib/match";
import type { Quiz, UserAnswer } from "@/lib/types";

/**
 * Always-rendered slim strip. When the user has answers it shows the top
 * matching parties so far (running totals). Before any answer it shows a
 * placeholder of equal height, so the layout never shifts.
 */
export function LiveStandings({
  quiz,
  answers,
  limit = 4,
}: {
  quiz: Quiz;
  answers: UserAnswer[];
  limit?: number;
}) {
  const ranked = answers.length > 0 ? matchParties(quiz, answers).slice(0, limit) : [];

  return (
    <div className="glass flex h-9 items-center gap-x-3 overflow-hidden rounded-full px-3 text-[11px]">
      <span className="shrink-0 uppercase tracking-[0.18em] text-ink/55">
        Du ligger nærmest
      </span>
      {ranked.length === 0 ? (
        <span className="text-ink/40">Svar på en påstand, så ser du rangeringen her.</span>
      ) : (
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          {ranked.map((m, i) => (
            <li
              key={m.slug}
              className="flex items-center gap-1.5"
              title={`${m.party.name} — ${m.percent.toFixed(0)} %`}
            >
              <span className="tabular-nums text-ink/40">{i + 1}.</span>
              <PartyLogo party={m.party} size={18} ring={false} />
              <span className="font-medium text-ink/85">{m.party.abbr}</span>
              <span className="tabular-nums text-ink/55">{m.percent.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
      <span className="ml-auto shrink-0 tabular-nums text-ink/40">
        {answers.length} svar
      </span>
    </div>
  );
}
