"use client";

/**
 * Tiny window-event bus used to share quiz-mode state between the
 * header pill (where Nullstill + auto-advance now live) and the quiz
 * page itself, without pulling in a state library.
 */

export const QUIZ_RESET = "valgomat:reset";
export const PREFS_CHANGED = "valgomat:prefs";

export function emitReset() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(QUIZ_RESET));
}

export function emitPrefsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PREFS_CHANGED));
}
