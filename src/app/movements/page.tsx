function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{body}</p>
    </div>
  );
}

export default function MovementsPage() {
  return <Stub title="Movements" body="Movement lists were not auto-promoted from Keep. Open the archive notes if you need the originals." />;
}
