"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

/**
 * Five emoji buttons mapped to internal 1–7 scores at 1, 2, 4, 6, 7.
 * Labels live under each button but are styled small — the emoji is the
 * primary affordance.
 */
export const EMOJI_OPTIONS = [
  { score: 1, emoji: "🙅", label: "Helt uenig" },
  { score: 2, emoji: "👎", label: "Uenig"      },
  { score: 4, emoji: "🤷", label: "Tja"        },
  { score: 6, emoji: "👍", label: "Enig"       },
  { score: 7, emoji: "🤩", label: "Helt enig"  },
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
            title={opt.label}
            onClick={() => onChange(opt.score)}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            className={clsx(
              "group relative isolate flex flex-col items-center justify-center gap-1",
              "rounded-2xl border px-2 py-3 sm:py-4",
              "transition-colors duration-200",
              active
                ? "border-ink bg-white"
                : "border-black/[0.06] bg-white/60 hover:bg-white/85"
            )}
          >
            <motion.span
              animate={active ? { scale: [1, 1.22, 1.08] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: [0.2, 0.6, 0.2, 1] }}
              className="text-[32px] leading-none sm:text-[36px]"
              aria-hidden
            >
              {opt.emoji}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
