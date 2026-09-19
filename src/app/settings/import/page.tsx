import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ImportSettingsPage() {
  const last = await prisma.importRun.findFirst({ orderBy: { startedAt: "desc" } });
  const keep = await prisma.rawKeepNote.count();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Import</h1>
      <p className="text-[var(--muted)]">
        ARCHIVE_DIR points at <code>./data</code>. Keep JSON is stored as raw notes and extraction candidates only.
        HTML is ignored. Re-running the importer skips duplicates.
      </p>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <div>Keep JSON notes: {keep}</div>
        <div>Last import: {last?.finishedAt?.toISOString() ?? "never"}</div>
        {last?.stats ? (
          <pre className="mt-3 max-h-96 overflow-auto text-xs">{JSON.stringify(last.stats, null, 2)}</pre>
        ) : null}
      </div>
    </div>
  );
}
