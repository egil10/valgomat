"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";

import { PartyLogo } from "@/components/PartyLogo";
import { questionAlignment } from "@/lib/match";
import type { PartySlug, Question, Quiz, UserAnswer } from "@/lib/types";

/**
 * Right-pane panel. Lives next to the question card and updates live as the
 * user picks/changes their answer. Empty state is rendered when no answer
 * is set yet — same dimensions so the layout doesn't shift.
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
  if (!answer) return <EmptyState quiz={quiz} question={question} />;
  return <ResolvedPanel quiz={quiz} question={question} answer={answer} />;
}

function EmptyState({ quiz, question }: { quiz: Quiz; question: Question }) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
        Partienes posisjoner
      </p>
      <div className="mt-3">
        <Spectrum quiz={quiz} question={question} userScore={null} />
      </div>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-black/[0.08] bg-white/35 p-6 text-center">
        <p className="max-w-[28ch] text-sm text-ink/55">
          Velg et svar til venstre — partienes utdrag dukker opp her.
        </p>
      </div>
    </div>
  );
}

function ResolvedPanel({
  quiz,
  question,
  answer,
}: {
  quiz: Quiz;
  question: Question;
  answer: UserAnswer;
}) {
  const ranked = useMemo(
    () => questionAlignment(quiz, answer).sort((a, b) => a.diff - b.diff),
    [quiz, answer]
  );
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ranked : ranked.slice(0, 4);
  const hidden = ranked.length - visible.length;

  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
        Partienes posisjoner
      </p>
      <div className="mt-3">
        <Spectrum quiz={quiz} question={question} userScore={answer.score} />
      </div>

      <ul className="mt-5 flex-1 space-y-0">
        {visible.map((r) => {
          const party = quiz.parties[r.slug as PartySlug];
          return (
            <li
              key={r.slug}
              className="flex items-start gap-3 border-b border-black/[0.05] py-2 last:border-b-0"
            >
              <PartyLogo party={party} size={32} ring={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {party.name}
                    <span className="ml-1 text-ink/40">· {party.abbr}</span>
                  </p>
                  <span
                    className={clsx(
                      "ml-auto shrink-0 text-[11px] font-medium tabular-nums",
                      r.diff === 0 ? "text-emerald-700" :
                      r.diff <= 1   ? "text-lime-700"    :
                      r.diff <= 3   ? "text-amber-700"   :
                                      "text-rose-700"
                    )}
                  >
                    {r.diff === 0 ? "samme" : `${r.diff} unna`}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/70">«{r.quote}»</p>
              </div>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 self-start text-[11px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink/85"
        >
          Vis {hidden} til
        </button>
      )}
    </div>
  );
}

/** Static, layout-stable spectrum. No motion animations on the markers so the
 *  panel doesn't trigger height jumps when the user changes their answer. */
function Spectrum({
  quiz,
  question,
  userScore,
}: {
  quiz: Quiz;
  question: Question;
  userScore: number | null;
}) {
  const entries = (Object.keys(quiz.parties) as PartySlug[]).map((slug) => ({
    slug,
    score: question.positions[slug].score,
    party: quiz.parties[slug],
  }));
  const byScore = new Map<number, typeof entries>();
  for (const e of entries) {
    const list = byScore.get(e.score) ?? [];
    list.push(e);
    byScore.set(e.score, list);
  }
  function toPct(score: number) {
    return 8 + ((score - 1) / 6) * 84;
  }

  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-ink/45">
        <span>Uenig</span>
        <span>Enig</span>
      </div>
      <div className="relative h-24 rounded-2xl border border-black/[0.06] bg-white/40">
        <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-black/15" />
        {userScore !== null && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-300"
            style={{ left: `${toPct(userScore)}%` }}
          >
            <span className="pill block bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
              Deg
            </span>
          </div>
        )}
        {entries.map((e) => {
          const stack = byScore.get(e.score)!;
          const idx = stack.indexOf(e);
          const offsetY = stack.length === 1 ? 0 : idx % 2 === 0 ? -22 : 22;
          return (
            <div
              key={e.slug}
              className="absolute top-1/2 -translate-x-1/2"
              style={{
                left: `${toPct(e.score)}%`,
                transform: `translate(-50%, calc(-50% + ${offsetY}px))`,
              }}
              title={`${e.party.name} — ${e.score}/7`}
            >
              <PartyLogo party={e.party} size={28} ring={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
