"use client";

import clsx from "clsx";
import { SignalLow, SignalMedium, SignalHigh, type LucideIcon } from "lucide-react";

type Option = { value: number; Icon: LucideIcon; label: string };

const OPTIONS: Option[] = [
  { value: 1, Icon: SignalLow,    label: "Lite viktig"  },
  { value: 2, Icon: SignalMedium, label: "Viktig"       },
  { value: 3, Icon: SignalHigh,   label: "Svært viktig" },
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
        {OPTIONS.map(({ value: v, Icon, label }) => {
          const isActive = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={label}
              title={label}
              onClick={() => onChange(v)}
              className={clsx(
                "flex h-9 w-10 items-center justify-center rounded-full transition-colors duration-150",
                isActive
                  ? "bg-ink text-white"
                  : "bg-white/55 text-ink/55 hover:text-ink/85"
              )}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
