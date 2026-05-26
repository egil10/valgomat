"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { QuizHeaderControls } from "@/components/QuizHeaderControls";

const NAV = [
  { href: "/",       label: "Hjem"      },
  { href: "/quiz",   label: "Valgomat"  },
  { href: "/kilder", label: "Kilder"    },
  { href: "/om",     label: "Metode"    },
];

export function PillHeader() {
  const pathname = usePathname();
  const onQuiz = pathname?.startsWith("/quiz") ?? false;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Hovedmeny"
        className={clsx(
          "pointer-events-auto glass-ios rounded-full px-3 py-1.5 sm:px-4",
          "grid w-full max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3"
        )}
      >
        {/* Left: brand mark */}
        <Link
          href="/"
          aria-label="Forside"
          className="pill flex items-center gap-2 pl-1 pr-2 text-ink hover:opacity-80"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink" />
          <span className="hidden font-display text-sm font-medium sm:inline">
            valgomat
          </span>
        </Link>

        {/* Center: nav */}
        <ul className="flex items-center justify-center gap-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "pill px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-ink text-white" : "text-ink/65 hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: quiz controls (on /quiz) or session badge (elsewhere) */}
        <div className="flex min-w-[120px] items-center justify-end">
          {onQuiz ? (
            <QuizHeaderControls />
          ) : (
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-ink/45 sm:inline">
              2025 — 2029
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
