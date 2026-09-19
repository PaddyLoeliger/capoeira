import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UnidentifiedPage() {
  const items = await prisma.researchItem.findMany({
    where: { songId: null },
    orderBy: { workingTitle: "asc" },
  });
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
        <h1 className="text-2xl">Unidentified</h1>
        <p className="mt-2 text-[var(--muted)]">Every identification-queue fragment is linked to an exact song title, or nothing has been imported yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Unidentified</h1>
      <p className="text-[var(--muted)]">Queue fragments with no exact title match. Similar titles were not auto-merged.</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
            <div className="font-medium">{item.workingTitle}</div>
            {item.sourceNotes ? <div className="text-sm text-[var(--muted)]">{item.sourceNotes}</div> : null}
            <Link href="/research" className="text-sm text-[var(--accent)]">
              Open research
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
