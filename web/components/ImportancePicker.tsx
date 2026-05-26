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
  const active = OPTIONS.find((o) => o.value === value) ?? OPTIONS[1];
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Viktighet</p>
        <p className="mt-0.5 text-sm font-medium text-ink/85">{active.label}</p>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label="Viktighet">
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
                "h-9 min-w-12 rounded-full px-3 text-sm font-medium tabular-nums leading-none transition-colors duration-150",
                isActive
                  ? "bg-ink text-white"
                  : "bg-white/55 text-ink/55 hover:text-ink/85"
              )}
            >
              {o.dots}
            </button>
          );
        })}
      </div>
    </div>
  );
}
