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

const DATE_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return DATE_FORMAT.format(d);
}

/**
 * Real speech excerpts from regjeringen.no (and Stortinget). The card has
 * three rows of metadata so nothing has to truncate the date out of view:
 *   1. source chip + date chip (never wraps)
 *   2. speaker (single line, truncates if too long)
 *   3. quote (line-clamp-2)
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
        style={{ animationDuration: `${Math.max(120, items.length * 10)}s`, animationDirection: "reverse" }}
      >
        {doubled.map((it, i) => (
          <li
            key={`${it.url}-${i}`}
            className="flex w-[420px] shrink-0 items-start gap-3 rounded-2xl border border-black/[0.05] bg-ink/[0.04] p-4"
          >
            <Image
              src={LOGO_BY_SOURCE[it.source]}
              alt={it.source_label}
              width={36}
              height={36}
              className={
                it.source === "regjeringen"
                  ? "h-9 w-9 shrink-0 rounded"
                  : "h-8 w-auto shrink-0 self-start"
              }
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="pill bg-ink/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                  {it.source_label}
                </span>
                {it.date && (
                  <span className="pill bg-white/70 px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink/70">
                    {fmtDate(it.date)}
                  </span>
                )}
              </div>
              {it.speaker && (
                <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-ink/55">
                  {it.speaker}
                </p>
              )}
              <a
                href={it.url}
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
