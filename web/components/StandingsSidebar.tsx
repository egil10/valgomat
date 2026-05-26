"use client";

import { Eye, EyeOff } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { matchParties } from "@/lib/match";
import type { Quiz, UserAnswer } from "@/lib/types";

/**
 * Vertical companion card to the valgomat — shows the running top match
 * across all parties. The eye toggle in the corner hides/shows the panel.
 * When hidden, the quiz page renders just the floating eye button instead.
 */
export function StandingsSidebar({
  quiz,
  answers,
  onHide,
}: {
  quiz: Quiz;
  answers: UserAnswer[];
  onHide: () => void;
}) {
  const ranked = answers.length > 0 ? matchParties(quiz, answers) : [];

  return (
    <aside
      className="glass relative flex h-full flex-col rounded-3xl p-4 sm:p-5"
      aria-label="Din rangering så langt"
    >
      <button
        type="button"
        onClick={onHide}
        title="Skjul rangering"
        aria-label="Skjul rangering"
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.06] bg-white/70 text-ink/60 transition-colors hover:bg-white hover:text-ink"
      >
        <EyeOff size={14} aria-hidden />
      </button>

      <div className="flex items-baseline justify-between pr-9">
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

/**
 * Tiny floating eye-button shown in the same spot when the sidebar is
 * hidden, so users always have a one-click way to bring the panel back.
 */
export function StandingsShowButton({ onShow }: { onShow: () => void }) {
  return (
    <button
      type="button"
      onClick={onShow}
      title="Vis rangering"
      aria-label="Vis rangering"
      className="glass inline-flex h-9 w-9 items-center justify-center self-start rounded-full text-ink/65 transition-colors hover:text-ink"
    >
      <Eye size={15} aria-hidden />
    </button>
  );
}
