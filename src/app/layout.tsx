import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roda Caderno",
  description: "Personal Capoeira knowledge base and training companion",
};

const nav = [
  ["Dashboard", "/dashboard"],
  ["Songs", "/songs"],
  ["Practice", "/songs/practice"],
  ["Unidentified", "/songs/unidentified"],
  ["Search", "/search"],
  ["Research", "/research"],
  ["People", "/people"],
  ["History", "/history"],
  ["Movements", "/movements"],
  ["Training", "/training"],
  ["Sources", "/sources"],
  ["Import", "/settings/import"],
  ["Export", "/settings/export"],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex min-h-full flex-col md:flex-row">
          <header className="border-b border-[var(--line)] bg-[var(--panel)] md:w-56 md:border-b-0 md:border-r">
            <div className="px-4 py-4">
              <Link href="/dashboard" className="font-[family-name:var(--font-display)] text-xl">
                Roda Caderno
              </Link>
              <p className="mt-1 text-xs text-[var(--muted)]">Preserve first. Structure second.</p>
            </div>
            <nav className="flex gap-3 overflow-x-auto px-4 pb-3 md:flex-col md:overflow-visible md:pb-6">
              {nav.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="whitespace-nowrap text-sm text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
