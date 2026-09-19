import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [songs, keepNotes, research, lyrics, unidentified, comfortable] = await Promise.all([
    prisma.song.count(),
    prisma.rawKeepNote.count(),
    prisma.researchItem.count(),
    prisma.songVersion.count(),
    prisma.researchItem.count({ where: { songId: null } }),
    prisma.song.count({ where: { learningStatus: "COMFORTABLE" } }),
  ]);

  const cards = [
    ["Songs", songs, "/songs"],
    ["Keep notes", keepNotes, "/settings/import"],
    ["Research items", research, "/research"],
    ["Lyric versions", lyrics, "/songs"],
    ["Unidentified", unidentified, "/songs/unidentified"],
    ["Comfortable", comfortable, "/songs/practice"],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-1 text-[var(--muted)]">Counts come from the imported archive, not placeholders.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, count, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm">
            <div className="text-sm text-[var(--muted)]">{label}</div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-4xl">{count}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
