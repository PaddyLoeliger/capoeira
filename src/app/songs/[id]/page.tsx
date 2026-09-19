import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { labelLearning, labelVerification } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      versions: true,
      aliases: true,
      citations: true,
      researchItems: true,
      keepLinks: { include: { keepNote: true } },
    },
  });
  if (!song) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-[var(--accent)]">Song</p>
        <h1 className="text-4xl leading-tight">{song.title}</h1>
        <p className="mt-2 text-[var(--muted)]">
          {[song.form, song.tradition].filter(Boolean).join(" / ") || song.formStyleRaw || "Form and tradition not recorded"}
        </p>
      </header>

      <section className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2">
        <Fact label="Learning" value={labelLearning(song.learningStatus)} />
        <Fact label="Verification" value={labelVerification(song.verificationKind)} />
        <Fact label="Occurrences" value={song.occurrences?.toString() ?? "—"} />
        <Fact label="Human review" value={song.needsHumanReview ? "Needed" : "Not flagged"} />
        {song.learningNote ? <Fact label="Learning note" value={song.learningNote} /> : null}
        {song.instrumentCues ? <Fact label="Instrument / entry" value={song.instrumentCues} /> : null}
      </section>

      {song.aliases.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xl">Aliases</h2>
          <ul className="flex flex-wrap gap-2">
            {song.aliases.map((alias) => (
              <li key={alias.id} className="rounded-full bg-[var(--panel)] px-3 py-1 text-sm">
                {alias.alias}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-xl">Lyrics from Keep notes</h2>
        {song.versions.length === 0 ? (
          <p className="text-[var(--muted)]">No Keep lyrics were recorded for this title. External lyrics were not imported.</p>
        ) : (
          song.versions.map((version) => (
            <pre key={version.id} className="whitespace-pre-wrap rounded-2xl bg-[var(--panel)] p-4 font-sans leading-relaxed">
              {version.lyrics}
            </pre>
          ))
        )}
      </section>

      {song.attributionNote ? (
        <section>
          <h2 className="mb-2 text-xl">Attribution / version</h2>
          <p>{song.attributionNote}</p>
        </section>
      ) : null}

      {song.researchNotes ? (
        <section>
          <h2 className="mb-2 text-xl">Research notes</h2>
          <p>{song.researchNotes}</p>
        </section>
      ) : null}

      {song.citations.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xl">Sources</h2>
          <ul className="space-y-2">
            {song.citations.map((citation) => (
              <li key={citation.id}>
                <a className="text-[var(--accent)] underline" href={citation.url} target="_blank" rel="noreferrer">
                  {citation.url}
                </a>
                {citation.note ? <p className="text-sm text-[var(--muted)]">{citation.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {song.keepLinks.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xl">Attached Keep notes</h2>
          <ul className="space-y-3">
            {song.keepLinks.map((link) => (
              <li key={link.id} className="rounded-2xl bg-[var(--panel)] p-4">
                <div className="font-medium">{link.keepNote.title || link.keepNote.fileName}</div>
                <div className="text-xs text-[var(--muted)]">via {link.via.replace("_", " ")}</div>
                {link.keepNote.textContent ? (
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm">
                    {link.keepNote.textContent}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {song.sourceKeepNotes ? (
        <section>
          <h2 className="mb-2 text-xl">Source Keep notes (spreadsheet)</h2>
          <p className="text-sm">{song.sourceKeepNotes}</p>
        </section>
      ) : null}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div>{value}</div>
    </div>
  );
}
