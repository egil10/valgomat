"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { questionAlignment } from "@/lib/match";
import type { PartySlug, Question, Quiz, UserAnswer } from "@/lib/types";

/**
 * Full-width party reveal. Hidden until the user has answered so the user
 * commits before seeing party positions. Sorted by L1 distance from user.
 * Each quote is a link to the deep page+search fragment if we have one,
 * otherwise to the party program landing page.
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
    <section className="glass rounded-3xl p-5 sm:p-7" aria-label="Partienes svar">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Partienes svar</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">Sortert etter match</p>
      </div>

      <ul className="mt-4 grid gap-x-8 gap-y-3 lg:grid-cols-2">
        {ranked.map((r) => {
          const party = quiz.parties[r.slug as PartySlug];
          const pos = question.positions[r.slug as PartySlug];
          const href = pos.source_url ?? party.program_url;
          return (
            <li key={r.slug} className="flex items-start gap-3 border-b border-black/[0.05] py-2 last:border-b-0">
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
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/quote mt-0.5 line-clamp-2 inline text-sm leading-snug text-ink/70 underline-offset-2 hover:underline"
                  title={pos.source_page ? `Åpne side ${pos.source_page} i partiprogrammet` : "Åpne partiprogrammet"}
                >
                  «{r.quote}»
                  <span className="ml-1 inline-flex items-center gap-0.5 align-baseline text-[10px] text-ink/40 opacity-0 transition-opacity group-hover/quote:opacity-100">
                    {pos.source_page && <>s. {pos.source_page}</>}
                    <ExternalLink size={11} aria-hidden />
                  </span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Locked() {
  return (
    <section
      className="rounded-3xl border border-dashed border-black/[0.10] bg-white/30 p-6 text-center"
      aria-label="Partienes svar — skjult"
    >
      <p className="font-display text-lg font-medium text-ink/70">
        Svar først — så ser du hvor partiene står.
      </p>
      <p className="mx-auto mt-1 max-w-prose text-sm text-ink/55">
        Posisjonene skjules til du har valgt et emoji, så matchen blir et ærlig speil av hva du faktisk mener.
      </p>
    </section>
  );
}
