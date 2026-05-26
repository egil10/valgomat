"use client";

import { useEffect, useRef } from "react";

/**
 * Cheap pointer-following glow. We render a single fixed div whose
 * `background-position` is driven by `--mx` / `--my` CSS variables,
 * updated at most once per animation frame from pointermove. No React
 * state, no re-renders, no transitions on the glow element itself.
 * Disabled on touch and when prefers-reduced-motion is set.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 3;
    let raf = 0;
    let dirty = false;

    function apply() {
      raf = 0;
      if (!el) return;
      el.style.setProperty("--mx", `${mx}px`);
      el.style.setProperty("--my", `${my}px`);
      dirty = false;
    }

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (!dirty) {
        dirty = true;
        raf = window.requestAnimationFrame(apply);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%)," +
          " rgba(232, 17, 45, 0.10) 0%," +
          " rgba(0, 101, 241, 0.10) 35%," +
          " rgba(20, 119, 61, 0.10) 60%," +
          " transparent 75%)",
        transition: "background 80ms linear",
      }}
    />
  );
}
