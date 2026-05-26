"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { PartyMatch } from "@/lib/types";

export function PartyBar({ match, rank }: { match: PartyMatch; rank: number }) {
  const pct = Math.max(0, Math.min(100, match.percent));
  return (
    <li className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4">
      <span className="font-display text-2xl font-semibold tabular-nums text-ink/30">
        {rank}
      </span>
      <div className="min-w-0">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <p className="truncate text-base font-semibold text-ink sm:text-lg">
            {match.party.name}{" "}
            <span className="ml-1 text-ink/40">{match.party.abbr}</span>
          </p>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.05 * rank }}
            className={clsx(
              "absolute inset-y-0 left-0 rounded-full",
              "shadow-[inset_0_-1px_0_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]"
            )}
            style={{
              background: `linear-gradient(90deg, ${match.party.color}cc, ${match.party.color})`,
            }}
          />
        </div>
      </div>
      <span className="font-display text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {Math.round(pct)}<span className="text-ink/40">%</span>
      </span>
    </li>
  );
}
