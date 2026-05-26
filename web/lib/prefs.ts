"use client";

import type { AutoMode } from "@/components/AutoAdvance";

const KEY = "valgomat:prefs:v1";

/** Quiz lengths offered upfront: short tasters up through the full pool. */
export const LENGTH_OPTIONS = [10, 25, 50, 100, "all"] as const;
export type QuizLength = typeof LENGTH_OPTIONS[number];

export type Prefs = {
  autoAdvance: AutoMode;
  length: QuizLength;
  showStandings: boolean;
};

const DEFAULT: Prefs = {
  autoAdvance: "manual",
  length: 25,
  showStandings: true,
};

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

export function savePrefs(prefs: Partial<Prefs>) {
  if (typeof window === "undefined") return;
  const current = loadPrefs();
  window.localStorage.setItem(KEY, JSON.stringify({ ...current, ...prefs }));
}

export function resolveLength(length: QuizLength, total: number): number {
  return length === "all" ? total : Math.min(length, total);
}

export function lengthLabel(length: QuizLength): string {
  return length === "all" ? "Alle" : String(length);
}
