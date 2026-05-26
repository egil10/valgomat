"use client";

import clsx from "clsx";

const OPTIONS = [
  { value: 1, label: "Lite viktig" },
  { value: 2, label: "Viktig" },
  { value: 3, label: "Svært viktig" },
];

export function ImportancePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-ink/55">Hvor viktig?</span>
      <div className="flex gap-1 rounded-full bg-white/55 p-1 ring-1 ring-black/5">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors sm:text-sm",
              value === o.value
                ? "bg-ink text-white shadow-button"
                : "text-ink/65 hover:bg-black/5"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
