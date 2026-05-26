"use client";

import type { UserAnswer } from "./types";

const ANSWERS_KEY = "valgomat:answers:v1";
const ORDER_KEY = "valgomat:order:v1";

export function loadAnswers(): UserAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANSWERS_KEY);
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
  window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function clearAnswers() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ANSWERS_KEY);
}

/**
 * The shuffled question id order for the current game. Stored so a single
 * sitting always plays the same order even on reload, but a fresh game gets
 * a fresh shuffle.
 */
export function loadOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveOrder(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
}

export function clearOrder() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ORDER_KEY);
}

/** Fisher–Yates shuffle (in place). Returns the same array. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
