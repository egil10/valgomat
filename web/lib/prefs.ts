"use client";

import type { AutoMode } from "@/components/AutoAdvance";

const KEY = "valgomat:prefs:v1";

type Prefs = {
  autoAdvance: AutoMode;
};

const DEFAULT: Prefs = {
  autoAdvance: "manual",
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

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(prefs));
}
