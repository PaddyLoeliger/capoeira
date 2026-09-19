import Link from "next/link";
import { prisma } from "@/lib/db";
import { labelLearning } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const songs = await prisma.song.findMany({
    where: { learningStatus: { in: ["COMFORTABLE", "LEARNING"] } },
    orderBy: [{ learningStatus: "asc" }, { title: "asc" }],
  });
  if (songs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
        <h1 className="text-2xl">Practice</h1>
        <p className="mt-2 text-[var(--muted)]">No comfortable or in-progress songs imported yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Practice</h1>
      <p className="text-[var(--muted)]">Comfortable and learning songs from the archive mapping.</p>
      <ul className="space-y-2">
        {songs.map((song) => (
          <li key={song.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
            <Link href={`/songs/${song.id}`} className="font-medium">
              {song.title}
            </Link>
            <div className="text-sm text-[var(--muted)]">{labelLearning(song.learningStatus)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
