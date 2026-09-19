import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExportSettingsPage() {
  const songs = await prisma.song.findMany({
    orderBy: { title: "asc" },
    select: { title: true, form: true, tradition: true, learningStatus: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Export</h1>
      <p className="text-[var(--muted)]">Read-only snapshot of canonical song titles currently in the database.</p>
      {songs.length === 0 ? (
        <p>Nothing to export yet.</p>
      ) : (
        <pre className="overflow-auto rounded-2xl bg-[var(--panel)] p-4 text-sm">
          {JSON.stringify(songs, null, 2)}
        </pre>
      )}
    </div>
  );
}
