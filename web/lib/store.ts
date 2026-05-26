"use client";

import type { UserAnswer } from "./types";

const KEY = "valgomat:answers:v1";

export function loadAnswers(): UserAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAnswers(answers: UserAnswer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(answers));
}

export function clearAnswers() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
