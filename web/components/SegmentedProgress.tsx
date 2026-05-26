"use client";

/**
 * Gradient progress bar — fills smoothly with the share of answered
 * questions, regardless of pool size. A thin amber tick marks the
 * current question's position on the same track so the user sees
 * "where I am" vs. "how much I've actually answered" at a glance.
 */
export function SegmentedProgress({
  total,
  answered,
  index,
}: {
  total: number;
  /** Indices of questions in the pool that have been answered. */
  answered: Set<number>;
  /** Current question index (0-based). */
  index: number;
}) {
  const answeredCount = answered.size;
  const pctAnswered = total === 0 ? 0 : (answeredCount / total) * 100;
  const pctCursor = total === 0 ? 0 : ((index + 0.5) / total) * 100;

  return (
    <div className="flex min-w-[180px] flex-1 items-center gap-3">
      <div
        className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/[0.07]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        aria-label="Fremdrift"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-[width] duration-500 ease-out"
          style={{ width: `${pctAnswered}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(0,0,0,0.04)] transition-[left] duration-500 ease-out"
          style={{ left: `${pctCursor}%` }}
          aria-hidden
        />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-ink/55">
        {answeredCount} / {total}
      </span>
    </div>
  );
}
