"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/",        label: "Hjem" },
  { href: "/quiz",    label: "Quiz" },
  { href: "/om",      label: "Metode" },
];

export function PillHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Hovedmeny"
        className="pointer-events-auto glass-strong flex items-center gap-1 rounded-full px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2"
      >
        <Link
          href="/"
          className="pill flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-ink hover:opacity-80"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-emerald-500 ring-1 ring-white/70" />
          <span className="tracking-tight">valgomat</span>
        </Link>
        <div className="hidden h-5 w-px bg-black/10 sm:block" />
        <ul className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "pill px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-ink text-white shadow-button"
                      : "text-ink/70 hover:bg-black/5 hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
