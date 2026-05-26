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
  const rows = useMemo(() => {
    if (answer) {
      const ranked = questionAlignment(quiz, answer).sort((a, b) => a.diff - b.diff);
      return ranked.map((r) => ({
        slug: r.slug as string,
        quote: r.quote,
        partyScore: r.partyScore,
        badge: { diff: r.diff } as { diff: number } | null,
      }));
    }
    // No answer yet: order by extremity-from-neutral so the column is non-empty.
    const entries = (Object.keys(quiz.parties) as PartySlug[]).map((slug) => ({
      slug: slug as string,
      score: question.positions[slug].score,
      quote: question.positions[slug].quote,
      diff: Math.abs(question.positions[slug].score - 4),
    }));
    entries.sort((a, b) => b.diff - a.diff);
    return entries.map((e) => ({
      slug: e.slug,
      quote: e.quote,
      partyScore: e.score,
      badge: null as null | { diff: number },
    }));
  }, [quiz, question, answer]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Partienes svar
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">
          {answer ? "Sortert etter match" : "Velg et svar →"}
        </p>
      </div>

      <ul className="mt-3 min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
        {rows.map((r) => {
          const party = quiz.parties[r.slug as PartySlug];
          const muted = !answer;
          return (
            <li
              key={r.slug}
              className="flex items-start gap-3 border-b border-black/[0.05] py-2.5 last:border-b-0"
            >
              <PartyLogo party={party} size={32} ring={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className={clsx("truncate text-sm font-medium", muted ? "text-ink/75" : "text-ink")}>
                    {party.name}
                    <span className="ml-1 text-ink/40">· {party.abbr}</span>
                  </p>
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums text-ink/40">
                    {r.partyScore}/7
                  </span>
                  {r.badge && (
                    <span
                      className={clsx(
                        "shrink-0 text-[11px] font-medium tabular-nums",
                        r.badge.diff === 0 ? "text-emerald-700" :
                        r.badge.diff <= 1   ? "text-lime-700"    :
                        r.badge.diff <= 3   ? "text-amber-700"   :
                                              "text-rose-700"
                      )}
                    >
                      {r.badge.diff === 0 ? "samme" : `${r.badge.diff} unna`}
                    </span>
                  )}
                </div>
                <a
                  href={party.program_url}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    "group/quote mt-0.5 line-clamp-2 inline text-sm leading-snug underline-offset-2 hover:underline",
                    muted ? "text-ink/55" : "text-ink/70"
                  )}
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
