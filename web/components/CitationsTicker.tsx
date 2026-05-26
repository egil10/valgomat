"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import type { PartySlug } from "@/lib/types";

/**
 * Infinite horizontal marquee of paraphrased party quotes. Pulled live from
 * the quiz data so the homepage and the underlying citations stay in sync.
 * The strip duplicates its content once and loops via a pure-CSS keyframe so
 * there's no JS scheduler running. Hovering pauses the animation.
 */
export function CitationsTicker({ count = 32 }: { count?: number }) {
  const items = useMemo(() => {
    const out: Array<{
      slug: PartySlug;
      partyName: string;
      partyAbbr: string;
      color: string;
      quote: string;
      href: string;
      logo: string;
    }> = [];
    const total = quiz.questions.length;
    const partyKeys = Object.keys(quiz.parties) as PartySlug[];

    // Spread picks evenly across the pool with a slight party rotation so the
    // strip doesn't get monopolized by any single party.
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
        quote: pos.quote,
        href: pos.source_url ?? party.program_url,
        logo: party.logo,
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
        className="ticker-track group flex w-max items-stretch gap-3"
        style={{ animationDuration: `${Math.max(60, count * 4)}s` }}
      >
        {doubled.map((it, i) => (
          <li
            key={`${it.slug}-${i}`}
            className="glass flex max-w-[420px] shrink-0 items-start gap-3 rounded-2xl px-4 py-3"
          >
            <PartyLogo
              party={{
                name: it.partyName,
                abbr: it.partyAbbr,
                color: it.color,
                logo: it.logo,
                program_url: it.href,
              }}
              size={28}
              ring={false}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[11px] uppercase tracking-[0.18em] text-ink/55">
                <span style={{ color: it.color }}>{it.partyAbbr}</span>
                <span className="text-ink/30">·</span>
                <span className="truncate">{it.partyName}</span>
              </div>
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/80 underline-offset-2 hover:underline"
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
