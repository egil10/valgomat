"use client";

/**
 * Smooth gradient progress bar — fills with the share of answered
 * questions, regardless of pool size.
 */
export function SegmentedProgress({
  total,
  answered,
}: {
  total: number;
  answered: Set<number>;
  /** Kept for backwards compatibility; no longer rendered. */
  index?: number;
}) {
  const answeredCount = answered.size;
  const pctAnswered = total === 0 ? 0 : (answeredCount / total) * 100;

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
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-ink/55">
        {answeredCount} / {total}
      </span>
    </div>
  );
}
