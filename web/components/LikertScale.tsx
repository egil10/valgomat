"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

const LABELS: Record<number, string> = {
  1: "Helt uenig",
  2: "Uenig",
  3: "Noe uenig",
  4: "Verken/eller",
  5: "Noe enig",
  6: "Enig",
  7: "Helt enig",
};

export function LikertScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="w-full">
      <div className="relative grid grid-cols-7 gap-1.5 rounded-full bg-white/55 p-1.5 ring-1 ring-black/5 backdrop-blur-md sm:gap-2 sm:p-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={active}
              aria-label={`${n} – ${LABELS[n]}`}
              className={clsx(
                "relative isolate flex h-12 items-center justify-center rounded-full text-base font-semibold transition-colors sm:h-14 sm:text-lg",
                active ? "text-white" : "text-ink/70 hover:bg-black/5"
              )}
            >
              {active && (
                <motion.span
                  layoutId="likert-thumb"
                  className="absolute inset-0 -z-10 rounded-full bg-ink shadow-button"
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                />
              )}
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between px-1 text-[11px] uppercase tracking-wider text-ink/55 sm:text-xs">
        <span>Helt uenig</span>
        <span className="hidden sm:inline">Verken/eller</span>
        <span>Helt enig</span>
      </div>
    </div>
  );
}
