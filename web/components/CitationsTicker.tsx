"use client";

import { ExternalLink } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { citationSamples, parties } from "@/lib/landing-data";

/**
 * Infinite horizontal marquee of paraphrased party quotes from the
 * pre-baked landing samples. No full-pool import; the landing chunk
 * stays small.
 */
export function CitationsTicker() {
  const items = citationSamples;
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div
      className="ticker-mask relative overflow-hidden"
      aria-label="Sitater fra partienes program"
    >
      <ul
        className="ticker-track flex w-max items-stretch gap-3"
        style={{ animationDuration: `${Math.max(120, items.length * 5)}s` }}
      >
        {doubled.map((it, i) => {
          const party = parties[it.slug];
          return (
            <li
              key={`${it.slug}-${i}`}
              className="glass flex w-[420px] shrink-0 items-start gap-3 rounded-2xl p-4"
            >
              <PartyLogo party={party} size={36} ring={false} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="pill px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white"
                    style={{ backgroundColor: it.color }}
                  >
                    {it.partyAbbr}
                  </span>
                  <span className="pill bg-white/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/70">
                    {it.topic}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-ink/55">
                  {it.axis}
                </p>
                <a
                  href={it.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block line-clamp-2 text-sm leading-snug text-ink/85 underline-offset-2 hover:underline"
                >
                  «{it.quote}»
                  <ExternalLink size={11} aria-hidden className="ml-1 inline align-baseline text-ink/40" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
