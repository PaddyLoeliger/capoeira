function Stub({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-8">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-2 text-[var(--muted)]">{body}</p>
    </div>
  );
}

export default function TrainingPage() {
  return <Stub title="Training" body="No training sessions were generated. Treino notes remain in data/Keep until structured later." />;
}
