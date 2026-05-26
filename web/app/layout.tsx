import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PillHeader } from "@/components/PillHeader";

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
      <body className="min-h-screen font-sans text-ink antialiased">
        <PillHeader />
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-32 sm:pt-36">{children}</main>
      </body>
    </html>
  );
}
