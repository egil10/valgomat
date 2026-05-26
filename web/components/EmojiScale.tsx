"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

/**
 * Five-button "emoji" Likert. The displayed buttons map to internal scores
 * on the 1–7 scale used in the data:
 *
 *   🙅 → 1     👎 → 2     🤷 → 4     👍 → 6     🤩 → 7
 *
 * The gap (no 3 or 5) is intentional — party positions can still be at 3 or
 * 5 in the data, the L1 match math just sees the user "round" toward the
 * nearest emoji.
 */
export const EMOJI_OPTIONS = [
  { score: 1, emoji: "🙅", label: "Helt uenig",  color: "from-rose-300/70   to-rose-500/80" },
  { score: 2, emoji: "👎", label: "Uenig",       color: "from-orange-300/70 to-rose-400/70" },
  { score: 4, emoji: "🤷", label: "Tja",         color: "from-stone-200/80  to-stone-400/70" },
  { score: 6, emoji: "👍", label: "Enig",        color: "from-lime-300/70   to-emerald-400/80" },
  { score: 7, emoji: "🤩", label: "Helt enig",   color: "from-emerald-300/70 to-sky-500/80" },
] as const;

export function EmojiScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Hvor enig er du?" className="grid grid-cols-5 gap-2 sm:gap-3">
      {EMOJI_OPTIONS.map((opt) => {
        const active = value === opt.score;
        return (
          <motion.button
            key={opt.score}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onClick={() => onChange(opt.score)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            className={clsx(
              "group relative isolate flex flex-col items-center justify-center gap-1.5",
              "rounded-3xl px-2 py-4 sm:py-5",
              "ring-1 transition-colors duration-200",
              active
                ? "bg-white/90 ring-ink/15 shadow-glass"
                : "bg-white/45 ring-black/[0.06] hover:bg-white/70"
            )}
          >
            {active && (
              <motion.span
                layoutId="emoji-glow"
                className={clsx(
                  "absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br opacity-90",
                  opt.color
                )}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <motion.span
              animate={active ? { scale: [1, 1.25, 1.1], rotate: [0, -6, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.6, 0.2, 1] }}
              className="text-[34px] leading-none drop-shadow sm:text-[40px]"
              aria-hidden
            >
              {opt.emoji}
            </motion.span>
            <span
              className={clsx(
                "text-[11px] font-medium leading-tight sm:text-xs",
                active ? "text-ink" : "text-ink/55"
              )}
            >
              {opt.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
