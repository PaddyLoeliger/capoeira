import Link from "next/link";
import { prisma } from "@/lib/db";
import { labelLearning } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { versions: true } } },
  });

  if (songs.length === 0) {
    return <Empty title="No songs yet" body="Run the archive import to load the Clean Master Index." />;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Songs</h1>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {songs.map((song) => (
          <li key={song.id}>
            <Link href={`/songs/${song.id}`} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-black/5">
              <div>
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-[var(--muted)]">
                  {[song.form, song.tradition].filter(Boolean).join(" · ") || "Form unknown"}
                  {" · "}
                  {labelLearning(song.learningStatus)}
                </div>
              </div>
              <div className="text-xs text-[var(--muted)]">{song._count.versions} lyric version{song._count.versions === 1 ? "" : "s"}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
      <h1 className="text-2xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{body}</p>
    </div>
  );
}
