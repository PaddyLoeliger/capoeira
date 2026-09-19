import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [legend, items] = await Promise.all([
    prisma.researchLegend.findMany({ orderBy: { status: "asc" } }),
    prisma.researchItem.findMany({
      orderBy: { workingTitle: "asc" },
      include: { song: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Research</h1>
      {legend.length > 0 ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h2 className="mb-3 text-xl">Research Guide</h2>
          <dl className="space-y-2">
            {legend.map((row) => (
              <div key={row.status}>
                <dt className="font-medium">{row.status}</dt>
                <dd className="text-sm text-[var(--muted)]">{row.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <p className="text-[var(--muted)]">No research legend imported yet.</p>
      )}
      <section>
        <h2 className="mb-3 text-xl">Identification queue</h2>
        {items.length === 0 ? (
          <p className="text-[var(--muted)]">Queue is empty until import runs.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <div className="font-medium">{item.workingTitle}</div>
                <div className="text-sm text-[var(--muted)]">
                  {item.song ? (
                    <Link href={`/songs/${item.song.id}`} className="text-[var(--accent)]">
                      Linked to exact title
                    </Link>
                  ) : (
                    "No exact title match"
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
