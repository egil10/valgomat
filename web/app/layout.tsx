import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PillHeader } from "@/components/PillHeader";
import { StatsBar } from "@/components/StatsBar";

export const metadata: Metadata = {
  title: "Valgomat — Ultimate norsk valgomat 2025",
  description:
    "Den kvantitative valgomaten. Match deg mot parti og enkeltpolitikere basert på faktiske utdrag fra partiprogrammene 2025–2029, Stortingets referater og Regjeringens taler.",
};

export const viewport: Viewport = {
  themeColor: "#F6F4EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className="flex min-h-screen flex-col font-sans text-ink antialiased">
        <PillHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10 pt-24 sm:pt-28">{children}</main>
        <StatsBar />
      </body>
    </html>
  );
}
