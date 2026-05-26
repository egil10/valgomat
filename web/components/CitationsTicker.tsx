"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import type { PartySlug } from "@/lib/types";

/**
 * Infinite horizontal marquee of paraphrased party quotes, pulled live from
 * the quiz pool. Three-row card layout matches the InstitutionalTicker:
 *   1. party chip + topic chip
 *   2. axis (single line, truncates)
 *   3. quote (line-clamp-2)
 * Hover pauses the animation.
 */
export function CitationsTicker({ count = 32 }: { count?: number }) {
  const items = useMemo(() => {
    const out: Array<{
      slug: PartySlug;
      partyName: string;
      partyAbbr: string;
      color: string;
      logo: string;
      topic: string;
      axis: string;
      quote: string;
      href: string;
    }> = [];
    const total = quiz.questions.length;
    const partyKeys = Object.keys(quiz.parties) as PartySlug[];

    const step = Math.max(1, Math.floor(total / count));
    for (let i = 0, n = 0; i < count; i++, n += step) {
      const q = quiz.questions[n % total];
      const slug = partyKeys[i % partyKeys.length];
      const pos = q.positions[slug];
      const party = quiz.parties[slug];
      out.push({
        slug,
        partyName: party.name,
        partyAbbr: party.abbr,
        color: party.color,
        logo: party.logo,
        topic: q.topic,
        axis: q.axis,
        quote: pos.quote,
        href: pos.source_url ?? party.program_url,
      });
    }
    return out;
  }, [count]);

  const doubled = [...items, ...items];

  return (
    <div
      className="ticker-mask relative overflow-hidden"
      aria-label="Sitater fra partienes program"
    >
      <ul
        className="ticker-track flex w-max items-stretch gap-3"
        style={{ animationDuration: `${Math.max(120, count * 5)}s` }}
      >
        {doubled.map((it, i) => (
          <li
            key={`${it.slug}-${i}`}
            className="glass flex w-[420px] shrink-0 items-start gap-3 rounded-2xl p-4"
          >
            <PartyLogo
              party={{
                name: it.partyName,
                abbr: it.partyAbbr,
                color: it.color,
                logo: it.logo,
                program_url: it.href,
              }}
              size={36}
              ring={false}
            />
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
        ))}
      </ul>
    </div>
  );
}
