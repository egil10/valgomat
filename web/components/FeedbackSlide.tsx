"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

import { PartyLogo } from "@/components/PartyLogo";
import { questionAlignment } from "@/lib/match";
import type { PartySlug, Question, Quiz, UserAnswer } from "@/lib/types";

/**
 * Right-pane panel. Always renders all 9 parties, sorted by distance from
 * the user's answer (or by extremity-from-neutral as a placeholder before
 * the user has answered). The list is the only thing that scrolls — the
 * surrounding card stays a fixed height so the layout is stable.
 */
export function FeedbackPanel({
  quiz,
  question,
  answer,
}: {
  quiz: Quiz;
  question: Question;
  answer: UserAnswer | undefined;
}) {
  if (!answer) return <Locked />;

  const ranked = questionAlignment(quiz, answer).sort((a, b) => a.diff - b.diff);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Partienes svar
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">
          Sortert etter match
        </p>
      </div>

      <ul className="mt-3 min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
        {ranked.map((r) => {
          const party = quiz.parties[r.slug as PartySlug];
          return (
            <li
              key={r.slug}
              className="flex items-start gap-3 border-b border-black/[0.05] py-2.5 last:border-b-0"
            >
              <PartyLogo party={party} size={32} ring={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {party.name}
                    <span className="ml-1 text-ink/40">· {party.abbr}</span>
                  </p>
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums text-ink/40">
                    {r.partyScore}/7
                  </span>
                  <span
                    className={clsx(
                      "shrink-0 text-[11px] font-medium tabular-nums",
                      r.diff === 0 ? "text-emerald-700" :
                      r.diff <= 1   ? "text-lime-700"    :
                      r.diff <= 3   ? "text-amber-700"   :
                                      "text-rose-700"
                    )}
                  >
                    {r.diff === 0 ? "samme" : `${r.diff} unna`}
                  </span>
                </div>
                <a
                  href={party.program_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group/quote mt-0.5 line-clamp-2 inline text-sm leading-snug text-ink/70 underline-offset-2 hover:underline"
                  title="Åpne partiprogrammet"
                >
                  «{r.quote}»
                  <ExternalLink size={11} className="ml-1 inline-block -translate-y-0.5 opacity-0 transition-opacity group-hover/quote:opacity-60" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Locked() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Partienes svar
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/35">
          Skjult
        </p>
      </div>
      <div className="mt-3 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-black/[0.10] bg-white/30 p-6 text-center">
        <div className="max-w-[28ch] space-y-2">
          <p className="font-display text-lg font-medium text-ink/75">
            Svar først.
          </p>
          <p className="text-sm leading-snug text-ink/55">
            Partienes posisjon vises etter at du har valgt — så får du en ærlig match uten å påvirkes av hva de mener.
          </p>
        </div>
      </div>
    </div>
  );
}
