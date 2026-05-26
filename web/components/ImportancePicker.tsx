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
    <div className="flex justify-center" role="radiogroup" aria-label="Hvor viktig er saken">
      <div className="flex gap-1 rounded-full border border-black/5 bg-white/55 p-0.5">
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
              "rounded-full px-3 py-1 text-xs font-medium tabular-nums transition-colors",
              value === o.value
                ? "bg-ink text-white"
                : "text-ink/55 hover:text-ink/80"
            )}
          >
            {o.dots}
          </button>
        ))}
      </div>
    </div>
  );
}
