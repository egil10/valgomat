"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

import institutionalQuotes from "@/public/data/institutional_quotes.json";

type InstitutionalQuote = {
  source: "regjeringen" | "stortinget";
  source_label: string;
  title: string;
  speaker: string;
  date: string;
  quote: string;
  url: string;
};

const LOGO_BY_SOURCE: Record<InstitutionalQuote["source"], string> = {
  regjeringen: "/logos/regjeringen.png",
  stortinget: "/logos/stortinget.svg",
};

/**
 * Second hero ticker — institutional sources. Pulls real-world speech
 * excerpts from regjeringen.no (and later Stortinget). Mirrors the
 * CitationsTicker visually but with a distinct logo column and a darker
 * tone so the two banners read as siblings, not duplicates.
 */
export function InstitutionalTicker() {
  const items = institutionalQuotes as InstitutionalQuote[];
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className="ticker-mask relative overflow-hidden"
      aria-label="Sitater fra Regjeringen og Stortinget"
    >
      <ul
        className="ticker-track flex w-max items-stretch gap-3"
        style={{ animationDuration: `${Math.max(80, items.length * 8)}s`, animationDirection: "reverse" }}
      >
        {doubled.map((it, i) => (
          <li
            key={`${it.url}-${i}`}
            className="flex max-w-[480px] shrink-0 items-start gap-3 rounded-2xl border border-black/[0.05] bg-ink/[0.04] px-4 py-3"
          >
            <Image
              src={LOGO_BY_SOURCE[it.source]}
              alt={it.source_label}
              width={32}
              height={32}
              className={
                it.source === "regjeringen"
                  ? "h-8 w-8 shrink-0 rounded"
                  : "h-7 w-auto shrink-0 self-center"
              }
              unoptimized
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[11px] uppercase tracking-[0.18em] text-ink/55">
                <span className="font-medium text-ink/80">{it.source_label}</span>
                {it.speaker && (
                  <>
                    <span className="text-ink/30">·</span>
                    <span className="truncate">{it.speaker}</span>
                  </>
                )}
                {it.date && (
                  <>
                    <span className="ml-auto text-ink/30">·</span>
                    <span className="tabular-nums text-ink/45">{it.date}</span>
                  </>
                )}
              </div>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/85 underline-offset-2 hover:underline"
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
