import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UnidentifiedPage() {
  const [queue, formUnknown, unattachedKeep] = await Promise.all([
    prisma.researchItem.findMany({
      where: { songId: null },
      orderBy: { workingTitle: "asc" },
    }),
    prisma.song.findMany({
      where: { form: null },
      orderBy: { title: "asc" },
    }),
    prisma.rawKeepNote.findMany({
      where: { songLinks: { none: {} }, reviewStatus: "pending" },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Needs structure</h1>
        <p className="text-[var(--muted)]">
          The identification queue already exact-matched every fragment. Use this page for songs without a recorded form
          and Keep notes that have not been attached.
        </p>
      </div>

      {queue.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-xl">Unlinked queue fragments</h2>
          <ul className="space-y-2">
            {queue.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <div className="font-medium">{item.workingTitle}</div>
                <Link href="/research" className="text-sm text-[var(--accent)]">
                  Open research
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-xl">Songs with form unknown</h2>
        {formUnknown.length === 0 ? (
          <p className="text-[var(--muted)]">Every canonical song has a recorded form.</p>
        ) : (
          <ul className="space-y-2">
            {formUnknown.map((song) => (
              <li key={song.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <Link href={`/songs/${song.id}`}>{song.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl">Pending Keep notes</h2>
        <p className="text-sm text-[var(--muted)]">
          Review attaches a note only on an exact title or alias.{" "}
          <Link href="/review" className="text-[var(--accent)]">
            Open review
          </Link>
        </p>
        {unattachedKeep.length === 0 ? (
          <p className="text-[var(--muted)]">No pending unattached Keep notes.</p>
        ) : (
          <ul className="space-y-2">
            {unattachedKeep.slice(0, 40).map((note) => (
              <li key={note.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                {note.title || note.fileName}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
