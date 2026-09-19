import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const citations = await prisma.citation.findMany({
    include: { song: true },
    orderBy: { url: "asc" },
  });
  if (citations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
        <h1 className="text-3xl">Sources</h1>
        <p className="mt-2 text-[var(--muted)]">No source URLs imported yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Sources</h1>
      <ul className="space-y-2">
        {citations.map((citation) => (
          <li key={citation.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
            <div>{citation.song.title}</div>
            <a className="text-sm text-[var(--accent)] underline" href={citation.url}>
              {citation.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
