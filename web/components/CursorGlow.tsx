"use client";

import { forwardRef, useEffect, useRef } from "react";

/**
 * Cursor-following watercolor glow rewritten for compositor-only paint:
 * three sibling divs, each with a *static* radial gradient, moved purely
 * via `transform: translate3d(x, y, 0) translate(-50%, -50%)`. The browser
 * doesn't re-rasterize per frame — it just shifts existing layers.
 *
 * Each blob has its own lerp speed so the shape never reads as a single
 * hard circle. Disabled on coarse pointers and prefers-reduced-motion.
 */
const Blob = forwardRef<HTMLDivElement, { color: string; size: number }>(
  function Blob({ color, size }, ref) {
    return (
      <div
        ref={ref}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          filter: "blur(40px)",
          mixBlendMode: "screen",
        }}
      />
    );
  },
);

export function CursorGlow() {
  const a = useRef<HTMLDivElement | null>(null);
  const b = useRef<HTMLDivElement | null>(null);
  const c = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;
    const state = [
      { ref: a, x: tx, y: ty, ease: 0.18 },
      { ref: b, x: tx, y: ty, ease: 0.11 },
      { ref: c, x: tx, y: ty, ease: 0.07 },
    ];

    let raf = 0;
    let running = true;

    function frame() {
      if (!running) return;
      for (const s of state) {
        s.x += (tx - s.x) * s.ease;
        s.y += (ty - s.y) * s.ease;
        const el = s.ref.current;
        if (el) el.style.transform = `translate3d(${s.x | 0}px, ${s.y | 0}px, 0) translate(-50%, -50%)`;
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
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Blob ref={a} color="rgba(255, 120, 140, 0.22)" size={560} />
      <Blob ref={b} color="rgba(120, 220, 160, 0.20)" size={680} />
      <Blob ref={c} color="rgba(140, 190, 255, 0.20)" size={760} />
    </div>
  );
}
