import Link from "next/link";
import { prisma } from "@/lib/db";
import { findExactSongMatch } from "@/lib/exact-title";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

function labelList(labels: unknown) {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => {
      if (typeof label === "string") return label;
      if (label && typeof label === "object" && "name" in label) {
        return String((label as { name: string }).name);
      }
      return "";
    })
    .filter(Boolean);
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const reviewStatus = ["pending", "attached", "rejected"].includes(status) ? status : "pending";

  const [notes, songs, counts] = await Promise.all([
    prisma.rawKeepNote.findMany({
      where: { reviewStatus },
      include: { candidates: true, songLinks: { include: { song: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.song.findMany({
      select: { id: true, title: true, aliases: { select: { alias: true } } },
    }),
    prisma.rawKeepNote.groupBy({
      by: ["reviewStatus"],
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((row) => [row.reviewStatus, row._count]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl">Keep review</h1>
        <p className="mt-1 text-[var(--muted)]">
          Attach a note only when its title equals a song title or a recorded alias. Close spellings are not offered.
          Lyrics stay on the Keep note; they are not copied onto the song.
        </p>
      </div>
      <div className="flex gap-3 text-sm">
        {(["pending", "attached", "rejected"] as const).map((value) => (
          <Link
            key={value}
            href={`/review?status=${value}`}
            className={value === reviewStatus ? "text-[var(--accent)]" : "text-[var(--muted)]"}
          >
            {value} ({countMap[value] ?? 0})
          </Link>
        ))}
      </div>
      {notes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">
          No {reviewStatus} Keep notes.
        </p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => {
            const match = findExactSongMatch(note.title, songs);
            const excerpt = (note.textContent ?? "").trim().slice(0, 360);
            return (
              <li key={note.id} className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
                <div>
                  <h2 className="text-xl">{note.title || note.fileName}</h2>
                  <p className="text-xs text-[var(--muted)]">{note.fileName}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {labelList(note.labels).map((name) => (
                      <span key={name} className="rounded-full bg-black/5 px-2 py-1">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                {excerpt ? <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{excerpt}</pre> : null}
                {match ? (
                  <p>
                    Exact match:{" "}
                    <Link className="text-[var(--accent)] underline" href={`/songs/${match.songId}`}>
                      {match.songTitle}
                    </Link>{" "}
                    via {match.via === "exact_title" ? "title" : "alias"}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    No exact title or alias. Similar titles are not listed on purpose.
                  </p>
                )}
                {note.songLinks.length > 0 ? (
                  <p className="text-sm">
                    Linked to{" "}
                    {note.songLinks.map((link) => (
                      <Link key={link.id} href={`/songs/${link.songId}`} className="text-[var(--accent)]">
                        {link.song.title}
                      </Link>
                    ))}
                  </p>
                ) : null}
                <ReviewActions keepNoteId={note.id} canAttach={Boolean(match)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
