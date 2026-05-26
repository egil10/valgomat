"use client";

import { memo } from "react";
import { ExternalLink } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { questionAlignment } from "@/lib/match";
import type { PartySlug, Question, Quiz, UserAnswer } from "@/lib/types";

/**
 * Always-rendered, fixed-height callout that shows which party is closest to
 * the user on this question, with their (paraphrased) quote linked to the
 * program. Before an answer it shows a placeholder of the same height — that
 * keeps the layout stable across questions.
 */
function BestMatchCalloutInner({
  quiz,
  question,
  answer,
}: {
  quiz: Quiz;
  question: Question;
  answer: UserAnswer | undefined;
}) {
  if (!answer) {
    return (
      <div className="flex h-[78px] items-center rounded-2xl border border-dashed border-black/[0.10] bg-white/30 px-4 text-sm text-ink/45">
        Velg et svar for å se hvilket parti som ligger nærmest deg på denne påstanden.
      </div>
    );
  }

  const ranked = questionAlignment(quiz, answer).sort((a, b) => a.diff - b.diff);
  const top = ranked[0];
  if (!top) return null;
  const party = quiz.parties[top.slug as PartySlug];
  const pos = question.positions[top.slug as PartySlug];
  const href = pos.source_url ?? party.program_url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-[78px] items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 transition hover:bg-white/85"
      title={pos.source_page ? `Åpne side ${pos.source_page} i partiprogrammet` : "Åpne partiprogrammet"}
    >
      <PartyLogo party={party} size={36} ring={false} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/55">
          <span>Nærmest deg på denne</span>
          <span className="text-ink/30">·</span>
          <span style={{ color: party.color }}>{party.abbr}</span>
          <span className="ml-auto tabular-nums text-ink/45">
            {top.diff === 0 ? "samme" : `${top.diff} unna`}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/80 group-hover:underline group-hover:underline-offset-2">
          «{top.quote}»
          <ExternalLink size={11} aria-hidden className="ml-1 inline align-baseline text-ink/40" />
        </p>
      </div>
    </a>
  );
}

export const BestMatchCallout = memo(BestMatchCalloutInner);
