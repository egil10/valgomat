"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/",     label: "Hjem" },
  { href: "/quiz", label: "Quiz" },
  { href: "/om",   label: "Metode" },
];

export function PillHeader() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Hovedmeny"
        className="pointer-events-auto glass-strong flex items-center gap-1 rounded-full px-1.5 py-1 sm:gap-1.5 sm:px-2"
      >
        <Link
          href="/"
          aria-label="Forside"
          className="pill flex h-9 w-9 items-center justify-center text-ink hover:opacity-80"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-ink" />
        </Link>
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
                      ? "bg-ink text-white"
                      : "text-ink/65 hover:text-ink"
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
