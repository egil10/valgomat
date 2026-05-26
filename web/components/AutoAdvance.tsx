"use client";

import clsx from "clsx";

export type AutoMode = "manual" | "1" | "3" | "5";

export const AUTO_OPTIONS: Array<{ value: AutoMode; label: string }> = [
  { value: "manual", label: "Manuell" },
  { value: "1",      label: "1s"       },
  { value: "3",      label: "3s"       },
  { value: "5",      label: "5s"       },
];

export function AutoAdvanceToggle({
  value,
  onChange,
}: {
  value: AutoMode;
  onChange: (v: AutoMode) => void;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/55 p-0.5"
      role="radiogroup"
      aria-label="Auto-spørsmål"
    >
      {AUTO_OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.value === "manual" ? "Bla manuelt" : `Auto-svar etter ${o.value} sekunder`}
            onClick={() => onChange(o.value)}
            className={clsx(
              "rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors duration-150",
              active
                ? "bg-ink text-white"
                : "text-ink/55 hover:text-ink/85"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
