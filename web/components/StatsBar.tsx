import { dataStats } from "@/lib/stats";

const FORMAT = new Intl.NumberFormat("nb-NO");

const ITEMS: Array<{ value: string; label: string }> = [
  { value: String(dataStats.parties), label: "partier" },
  { value: FORMAT.format(dataStats.programPages), label: "sider partiprogram" },
  { value: `${(dataStats.programChars / 1_000_000).toFixed(2)}M`, label: "tegn analysert" },
  { value: FORMAT.format(dataStats.representatives), label: "stortingsrepresentanter" },
  { value: String(dataStats.questions), label: "påstander" },
  { value: FORMAT.format(dataStats.citations), label: "sitater" },
];

export function StatsBar() {
  return (
    <footer className="border-t border-black/[0.06] bg-white/40 px-5 pb-10 pt-8 backdrop-blur-md sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-wider text-ink/55">Datagrunnlag</p>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          {ITEMS.map((it) => (
            <li key={it.label}>
              <p className="font-display text-3xl font-semibold tracking-tight text-ink tabular-nums sm:text-4xl">
                {it.value}
              </p>
              <p className="mt-0.5 text-xs leading-tight text-ink/55">{it.label}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[11px] leading-relaxed text-ink/45">
          Programtekstene er ekstrahert fra de offisielle PDF-ene de ni partiene har vedtatt for
          stortingsperioden 2025–2029. Roster på stortingsrepresentanter hentet fra Stortingets
          åpne API (<code className="text-[0.95em]">data.stortinget.no/eksport</code>). Pipeline
          + kildekode på{" "}
          <a
            href="https://github.com/egil10/valgomat"
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/egil10/valgomat
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
