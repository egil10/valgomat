import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF7",
        ink: "#111111",
        muted: "#6B6B6B",
        glass: "rgba(255,255,255,0.65)",
        edge: "rgba(0,0,0,0.06)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "Helvetica Neue",
          "system-ui",
          "sans-serif",
        ],
        // Institutional serif for headlines — system stack picks Charter on
        // macOS/iOS and a high-quality serif on Windows. Keeps the page feeling
        // editorial without bundling a webfont.
        display: [
          "ui-serif",
          "Charter",
          "Iowan Old Style",
          "Source Serif Pro",
          "Georgia",
          "serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px -10px rgba(15,15,15,0.06), 0 1px 3px -1px rgba(15,15,15,0.04)",
        pill:  "0 4px 16px -6px rgba(15,15,15,0.10), 0 1px 1px rgba(15,15,15,0.04)",
        button: "0 6px 18px -8px rgba(15,15,15,0.30)",
      },
      backdropBlur: {
        xs: "8px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in":  "fadeIn 400ms cubic-bezier(.2,.6,.2,1) both",
        "rise-in":  "riseIn 480ms cubic-bezier(.2,.6,.2,1) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
