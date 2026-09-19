import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Hit = { id: string; title: string; score: number };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let hits: Hit[] = [];
  if (query) {
    hits = await prisma.$queryRaw<Hit[]>`
      SELECT s.id, s.title,
        greatest(
          similarity(unaccent(s.title), unaccent(${query})),
          coalesce((
            SELECT max(similarity(unaccent(a.alias), unaccent(${query})))
            FROM "SongAlias" a WHERE a."songId" = s.id
          ), 0)
        ) AS score
      FROM "Song" s
      WHERE unaccent(s.title) ILIKE '%' || unaccent(${query}) || '%'
         OR EXISTS (
           SELECT 1 FROM "SongAlias" a
           WHERE a."songId" = s.id
             AND unaccent(a.alias) ILIKE '%' || unaccent(${query}) || '%'
         )
      ORDER BY score DESC, s.title ASC
      LIMIT 50
    `;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Search</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Accent-insensitive title search"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2"
        />
        <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-white">Search</button>
      </form>
      {!query ? (
        <p className="text-[var(--muted)]">Search uses PostgreSQL unaccent + trigram similarity.</p>
      ) : hits.length === 0 ? (
        <p className="text-[var(--muted)]">No songs matched “{query}”.</p>
      ) : (
        <ul className="space-y-2">
          {hits.map((hit) => (
            <li key={hit.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
              <Link href={`/songs/${hit.id}`}>{hit.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
