"use client";

import clsx from "clsx";

const OPTIONS = [
  { value: 1, dots: "•",   label: "Lite viktig"  },
  { value: 2, dots: "••",  label: "Viktig"       },
  { value: 3, dots: "•••", label: "Svært viktig" },
];

export function ImportancePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-black/[0.05] bg-white/55 p-0.5"
      role="radiogroup"
      aria-label="Viktighet"
    >
      <span className="pl-2 text-[10px] uppercase tracking-[0.18em] text-ink/45">
        Vekt
      </span>
      {OPTIONS.map((o) => {
        const isActive = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.value)}
            className={clsx(
              "h-6 min-w-7 rounded-full px-2 text-xs font-medium tabular-nums leading-none transition-colors duration-150",
              isActive
                ? "bg-ink text-white"
                : "text-ink/55 hover:text-ink/85"
            )}
          >
            {o.dots}
          </button>
        );
      })}
    </div>
  );
}
