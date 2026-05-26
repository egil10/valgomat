import { dataStats } from "@/lib/stats";

const FORMAT = new Intl.NumberFormat("nb-NO");

const ITEMS: Array<{ value: string; label: string }> = [
  { value: String(dataStats.parties),                        label: "partier" },
  { value: FORMAT.format(dataStats.programPages),            label: "sider program" },
  { value: FORMAT.format(dataStats.representatives),         label: "representanter" },
  { value: FORMAT.format(dataStats.citations),               label: "sitater" },
];

export function StatsBar() {
  return (
    <footer className="border-t border-black/[0.06] px-5 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-6">
        <ul className="grid flex-1 grid-cols-2 gap-x-8 gap-y-2 sm:flex sm:gap-x-10">
          {ITEMS.map((it) => (
            <li key={it.label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-medium tabular-nums text-ink">
                {it.value}
              </span>
              <span className="text-xs text-ink/50">{it.label}</span>
            </li>
          ))}
        </ul>
        <a
          href="https://github.com/egil10/valgomat"
          className="text-xs text-ink/45 underline-offset-2 hover:text-ink/80 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          egil10/valgomat ↗
        </a>
      </div>
    </footer>
  );
}
