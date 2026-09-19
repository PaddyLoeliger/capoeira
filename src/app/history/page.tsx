function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{body}</p>
    </div>
  );
}

export default function HistoryPage() {
  return <Stub title="History" body="Historical notes stay in the Keep archive until they are reviewed. Nothing was invented here." />;
}
