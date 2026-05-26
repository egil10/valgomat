"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question, Quiz } from "@/lib/types";

/**
 * VG-style "argumenter for og mot": surfaces the single quote from the most-
 * agreeing party and the single quote from the most-disagreeing party so the
 * user gets an immediate, sourced sense of the political tension behind the
 * statement. We pick the parties with the highest and lowest position on the
 * 1–7 scale; ties broken by party display order.
 */
export function ArgumentReveal({ question, quiz }: { question: Question; quiz: Quiz }) {
  const [open, setOpen] = useState(false);

  const entries = Object.entries(question.positions);
  const enig = entries.reduce((best, [slug, p]) =>
    p.score > (best[1] as { score: number }).score ? [slug, p] : best
  );
  const uenig = entries.reduce((worst, [slug, p]) =>
    p.score < (worst[1] as { score: number }).score ? [slug, p] : worst
  );
  const enigParty = quiz.parties[enig[0] as keyof typeof quiz.parties];
  const uenigParty = quiz.parties[uenig[0] as keyof typeof quiz.parties];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pill inline-flex items-center gap-2 bg-white/55 px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-black/5 backdrop-blur transition hover:bg-white/75"
        aria-expanded={open}
      >
        <span aria-hidden>{open ? "▾" : "▸"}</span>
        {open ? "Skjul argumenter" : "Se hva partiene mener"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.6, 0.2, 1] }}
            className="grid gap-3 overflow-hidden sm:grid-cols-2"
          >
            <ArgumentCard
              tone="enig"
              label="Sterkest enig"
              party={enigParty}
              score={(enig[1] as { score: number }).score}
              quote={(enig[1] as { quote: string }).quote}
            />
            <ArgumentCard
              tone="uenig"
              label="Sterkest uenig"
              party={uenigParty}
              score={(uenig[1] as { score: number }).score}
              quote={(uenig[1] as { quote: string }).quote}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArgumentCard({
  tone,
  label,
  party,
  score,
  quote,
}: {
  tone: "enig" | "uenig";
  label: string;
  party: { name: string; abbr: string; color: string };
  score: number;
  quote: string;
}) {
  const accent = tone === "enig" ? "bg-emerald-500/15" : "bg-rose-500/15";
  const dot = tone === "enig" ? "🤩" : "🙅";
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/65 p-4 ring-1 ring-black/[0.06]">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${accent} blur-2xl`} aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-base leading-none" aria-hidden>{dot}</span>
          <span className="uppercase tracking-wider text-ink/55">{label}</span>
          <span className="ml-auto tabular-nums text-ink/45">{score}/7</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white"
            style={{ background: party.color }}
            aria-hidden
          />
          <p className="text-sm font-semibold text-ink">
            {party.name} <span className="font-normal text-ink/50">· {party.abbr}</span>
          </p>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/80">«{quote}»</p>
      </div>
    </div>
  );
}
