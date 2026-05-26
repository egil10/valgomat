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
    <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
      <span className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Viktighet</span>
      <div className="flex gap-1" role="radiogroup" aria-label="Viktighet">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.value)}
            className={clsx(
              "h-8 w-12 rounded-full text-xs font-medium tabular-nums transition-colors duration-150",
              value === o.value
                ? "bg-ink text-white"
                : "bg-white/55 text-ink/55 hover:text-ink/85"
            )}
          >
            {o.dots}
          </button>
        ))}
      </div>
    </div>
  );
}
