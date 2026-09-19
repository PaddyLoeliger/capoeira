function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{body}</p>
    </div>
  );
}

export default function PeoplePage() {
  return <Stub title="People" body="No people records were auto-created from Keep notes. This stays empty until you promote sources by hand." />;
}
