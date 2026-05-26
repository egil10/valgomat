"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following watercolor glow. Three independent blobs in party tones
 * (red, green, blue) trail the cursor with their own lag and offsets so the
 * shape never reads as a single hard circle — it dissolves and reforms as
 * the pointer moves. All rendered as a single fixed div with CSS variables
 * driven by one rAF callback; no React re-renders, no transition on the
 * heavy filter. Disabled on touch and prefers-reduced-motion.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Target = exact pointer, current = lerp-smoothed toward target.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;

    // Three blobs each with their own ease so they drift apart.
    const blobs = [
      { x: tx, y: ty, ease: 0.16 },
      { x: tx, y: ty, ease: 0.10 },
      { x: tx, y: ty, ease: 0.07 },
    ];

    let raf = 0;
    let running = true;

    function frame() {
      if (!running) return;
      let moved = false;
      for (const b of blobs) {
        const dx = tx - b.x;
        const dy = ty - b.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          b.x += dx * b.ease;
          b.y += dy * b.ease;
          moved = true;
        }
      }
      if (moved && el) {
        el.style.setProperty("--ax", `${blobs[0].x}px`);
        el.style.setProperty("--ay", `${blobs[0].y}px`);
        el.style.setProperty("--bx", `${blobs[1].x}px`);
        el.style.setProperty("--by", `${blobs[1].y}px`);
        el.style.setProperty("--cx", `${blobs[2].x}px`);
        el.style.setProperty("--cy", `${blobs[2].y}px`);
      }
      raf = window.requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      tx = e.clientX;
      ty = e.clientY;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = window.requestAnimationFrame(frame);
    return () => {
      running = false;
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          // Three soft radial blobs in party tones (red / green / blue),
          // each at a different lagged position so the shape always drifts.
          "radial-gradient(360px circle at var(--ax, 30%) var(--ay, 25%), rgba(232, 17, 45, 0.13), transparent 65%)," +
          "radial-gradient(420px circle at var(--bx, 60%) var(--by, 45%), rgba(20, 119, 61, 0.11), transparent 65%)," +
          "radial-gradient(500px circle at var(--cx, 45%) var(--cy, 70%), rgba(0, 101, 241, 0.10), transparent 65%)",
        filter: "blur(40px)",
        mixBlendMode: "multiply",
        opacity: 0.85,
      }}
    />
  );
}
