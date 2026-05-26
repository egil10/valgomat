import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F4EE",
        ink: "#0A0A0A",
        muted: "#6B6B6B",
        glass: "rgba(255,255,255,0.55)",
        edge: "rgba(255,255,255,0.6)",
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
        display: [
          "-apple-system",
          "SF Pro Display",
          "Inter",
          "Helvetica Neue",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 12px 40px -8px rgba(15,15,15,0.10), 0 2px 6px -2px rgba(15,15,15,0.06)",
        pill:  "0 6px 24px -8px rgba(15,15,15,0.18), 0 1px 2px rgba(15,15,15,0.06)",
        button: "0 8px 24px -10px rgba(15,15,15,0.35)",
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
