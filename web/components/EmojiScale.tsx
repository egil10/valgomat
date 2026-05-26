"use client";

import clsx from "clsx";

/**
 * Seven yellow-face emoji buttons mapped 1:1 to the 1–7 agreement scale.
 * No red, no orange — just yellow faces from "very upset" to "starstruck".
 */
export const EMOJI_OPTIONS = [
  { score: 1, emoji: "😖", label: "Helt uenig"  },
  { score: 2, emoji: "😞", label: "Uenig"       },
  { score: 3, emoji: "😕", label: "Noe uenig"   },
  { score: 4, emoji: "😐", label: "Tja"         },
  { score: 5, emoji: "🙂", label: "Noe enig"    },
  { score: 6, emoji: "😄", label: "Enig"        },
  { score: 7, emoji: "🤩", label: "Helt enig"   },
] as const;

export function EmojiScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Hvor enig er du?" className="grid grid-cols-7 gap-1.5 sm:gap-2">
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
              "h-14 sm:h-16 rounded-2xl border transition-colors duration-150",
              "flex items-center justify-center",
              active
                ? "border-ink bg-ink/[0.04]"
                : "border-black/[0.06] bg-white/55 hover:bg-white/85 active:bg-ink/[0.04]"
            )}
          >
            <span className="text-[26px] leading-none sm:text-[30px]" aria-hidden>
              {opt.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
