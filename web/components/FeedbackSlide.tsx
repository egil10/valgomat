"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { EMOJI_OPTIONS } from "@/components/EmojiScale";
import { GlassCard } from "@/components/GlassCard";
import { PartyLogo } from "@/components/PartyLogo";
import { questionAlignment } from "@/lib/match";
import type { PartySlug, Question, Quiz, UserAnswer } from "@/lib/types";

export function FeedbackSlide({
  quiz,
  question,
  answer,
  step,
  total,
  onNext,
}: {
  quiz: Quiz;
  question: Question;
  answer: UserAnswer;
  step: number;
  total: number;
  onNext: () => void;
}) {
  const ranked = useMemo(
    () => questionAlignment(quiz, answer).sort((a, b) => a.diff - b.diff),
    [quiz, answer]
  );
  const userEmoji = EMOJI_OPTIONS.find((o) => o.score === answer.score);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ranked : ranked.slice(0, 4);
  const hidden = ranked.length - visible.length;

  return (
    <GlassCard strong className="space-y-7">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          {question.topic} · Du svarte <span aria-hidden>{userEmoji?.emoji}</span>
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium leading-snug text-balance sm:text-3xl">
          {question.statement}
        </h2>
      </div>

      <Spectrum quiz={quiz} question={question} userScore={answer.score} />

      <ul className="space-y-2">
        {visible.map((r, i) => {
          const party = quiz.parties[r.slug as PartySlug];
          return (
            <motion.li
              key={r.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.3 }}
              className="flex items-start gap-3 border-b border-black/[0.05] pb-2 last:border-b-0"
            >
              <PartyLogo party={party} size={36} ring={false} />
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
            </motion.li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3">
        {hidden > 0 ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs text-ink/55 underline-offset-2 hover:text-ink/85 hover:underline"
          >
            Vis {hidden} til
          </button>
        ) : <span />}
        <button
          type="button"
          onClick={onNext}
          className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-button transition-transform hover:-translate-y-0.5"
        >
          {step === total ? "Resultater" : "Neste"} →
        </button>
      </div>
    </GlassCard>
  );
}

function Spectrum({
  quiz,
  question,
  userScore,
}: {
  quiz: Quiz;
  question: Question;
  userScore: number;
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
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-ink/50">
        <span>Uenig</span>
        <span>Enig</span>
      </div>
      <div className="relative h-20 rounded-2xl border border-black/[0.06] bg-white/40 sm:h-24">
        <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-black/15" />
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${toPct(userScore)}%` }}
        >
          <span className="pill block bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
            Deg
          </span>
        </motion.div>
        {entries.map((e) => {
          const stack = byScore.get(e.score)!;
          const idx = stack.indexOf(e);
          const offsetY = stack.length === 1 ? 0 : idx % 2 === 0 ? -20 : 20;
          return (
            <motion.div
              key={e.slug}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.04 * idx, type: "spring", stiffness: 220, damping: 18 }}
              className="absolute top-1/2 -translate-x-1/2"
              style={{
                left: `${toPct(e.score)}%`,
                transform: `translate(-50%, calc(-50% + ${offsetY}px))`,
              }}
              title={`${e.party.name} — ${e.score}/7`}
            >
              <PartyLogo party={e.party} size={30} ring={false} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
