"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

import { PartyLogo } from "@/components/PartyLogo";
import type { PartyMatch } from "@/lib/types";

/**
 * Result row with a CSS-only width-fill animation: render at 0, set the
 * real width on the next paint with a transition. Drops the framer-motion
 * dependency from the /results bundle (~30 kB).
 */
export function PartyBar({ match, rank }: { match: PartyMatch; rank: number }) {
  const pct = Math.max(0, Math.min(100, match.percent));
  const [w, setW] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setW(pct), 30 + rank * 50);
    return () => window.clearTimeout(t);
  }, [pct, rank]);

  return (
    <li className="group relative grid grid-cols-[1.75rem_2.5rem_1fr_auto] items-center gap-3 sm:gap-4">
      <span className="font-display text-2xl font-semibold tabular-nums text-ink/30">
        {rank}
      </span>
      <PartyLogo party={match.party} size={40} />
      <div className="min-w-0">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <p className="truncate text-base font-semibold text-ink sm:text-lg">
            {match.party.name}{" "}
            <span className="ml-1 text-ink/40">{match.party.abbr}</span>
          </p>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <span
            className={clsx(
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
              "shadow-[inset_0_-1px_0_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]"
            )}
            style={{
              width: `${w}%`,
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
