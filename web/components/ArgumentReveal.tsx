"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyLogo } from "@/components/PartyLogo";
import type { Question, Quiz, Party } from "@/lib/types";

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
    <div className="border-t border-black/[0.06] pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink/85"
        aria-expanded={open}
      >
        {open ? "Skjul" : "Argumenter for og mot"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.6, 0.2, 1] }}
            className="grid gap-2 overflow-hidden pt-3"
          >
            <ArgumentCard party={uenigParty} quote={(uenig[1] as { quote: string }).quote} mood="uenig" />
            <ArgumentCard party={enigParty}  quote={(enig[1]  as { quote: string }).quote} mood="enig"  />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArgumentCard({ party, quote, mood }: { party: Party; quote: string; mood: "enig" | "uenig" }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/50 p-3">
      <PartyLogo party={party} size={26} ring={false} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-ink/45">
          {mood === "enig" ? "Sterkest enig" : "Sterkest uenig"} · {party.abbr}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-ink/75">«{quote}»</p>
      </div>
    </div>
  );
}
