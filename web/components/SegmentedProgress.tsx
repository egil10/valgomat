"use client";

import clsx from "clsx";

/**
 * 10-circle segmented progress. Each circle represents 1/10 of the question
 * pool. The current segment gets a yellow ring, completed segments fill solid
 * green, and partial segments show a green pie filled in proportion to how
 * many questions in that chunk are answered. Designed to make a 388-question
 * quiz feel chunked and surveyable at a glance.
 */
export function SegmentedProgress({
  total,
  answered,
  index,
  segments = 10,
}: {
  total: number;
  /** Set of question indices that have an answer (1-based or 0-based, only size matters per segment). */
  answered: Set<number>;
  /** Current question index (0-based). */
  index: number;
  segments?: number;
}) {
  const perSegment = total / segments;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2" aria-label="Fremdrift">
        {Array.from({ length: segments }).map((_, seg) => {
          const start = Math.floor(seg * perSegment);
          const end = Math.floor((seg + 1) * perSegment);
          let done = 0;
          for (let i = start; i < end; i++) if (answered.has(i)) done++;
          const size = end - start;
          const pct = size === 0 ? 0 : done / size;
          const isCurrent = index >= start && index < end;
          const complete = pct >= 1;
          return (
            <span
              key={seg}
              title={`${done} / ${size} svart i bolk ${seg + 1}`}
              className={clsx(
                "relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border transition",
                complete
                  ? "border-emerald-600/70 bg-emerald-500"
                  : "border-black/15 bg-white/60",
                isCurrent && "ring-2 ring-amber-400 ring-offset-1 ring-offset-transparent"
              )}
            >
              {!complete && pct > 0 && (
                <span
                  className="block h-full w-full rounded-full bg-emerald-500/85"
                  style={{
                    clipPath: `inset(${(1 - pct) * 100}% 0 0 0)`,
                  }}
                  aria-hidden
                />
              )}
            </span>
          );
        })}
      </div>
      <span className="ml-2 text-[11px] tabular-nums text-ink/55">
        {answered.size} / {total}
      </span>
    </div>
  );
}
