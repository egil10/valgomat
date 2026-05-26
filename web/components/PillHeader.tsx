"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { QuizHeaderControls } from "@/components/QuizHeaderControls";

const NAV = [
  { href: "/",       label: "Hjem"   },
  { href: "/quiz",   label: "Quiz"   },
  { href: "/kilder", label: "Kilder" },
  { href: "/om",     label: "Metode" },
];

export function PillHeader() {
  const pathname = usePathname();
  const onQuiz = pathname?.startsWith("/quiz") ?? false;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Hovedmeny"
        className={clsx(
          "pointer-events-auto glass-strong flex items-center gap-2 rounded-full px-2 py-1.5",
          "min-w-[min(94vw,640px)] sm:px-3"
        )}
      >
        <Link
          href="/"
          aria-label="Forside"
          className="pill flex h-9 w-9 items-center justify-center text-ink hover:opacity-80"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink" />
        </Link>
        <ul className="flex items-center gap-0.5">
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
        <div className="ml-auto flex items-center">
          {onQuiz && <QuizHeaderControls />}
        </div>
      </nav>
    </header>
  );
}
