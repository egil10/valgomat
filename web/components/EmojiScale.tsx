"use client";

import clsx from "clsx";

/**
 * Five emoji buttons mapped to internal 1–7 scores at 1, 2, 4, 6, 7.
 * Minimal animation: a quick color/border change marks selection. No
 * spring, no glow ring, no auto-advance.
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
    <div role="radiogroup" aria-label="Hvor enig er du?" className="grid grid-cols-5 gap-2">
      {EMOJI_OPTIONS.map((opt) => {
        const active = value === opt.score;
        return (
          <button
            key={opt.score}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.score)}
            className={clsx(
              "h-16 rounded-2xl border transition-colors duration-150",
              "flex items-center justify-center",
              active
                ? "border-ink bg-ink/[0.04]"
                : "border-black/[0.06] bg-white/55 hover:bg-white/85 active:bg-ink/[0.04]"
            )}
          >
            <span className="text-[30px] leading-none sm:text-[34px]" aria-hidden>
              {opt.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
