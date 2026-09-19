"use client";

import { useTransition } from "react";
import { attachKeepNote, rejectKeepNote, restoreKeepNote } from "./actions";

export function ReviewActions({
  keepNoteId,
  canAttach,
}: {
  keepNoteId: string;
  canAttach: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!canAttach || pending}
        onClick={() => start(() => attachKeepNote(keepNoteId))}
        className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-40"
      >
        Attach exact match
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => rejectKeepNote(keepNoteId))}
        className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
      >
        Reject
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => restoreKeepNote(keepNoteId))}
        className="rounded-xl px-3 py-2 text-sm text-[var(--muted)]"
      >
        Reset to pending
      </button>
    </div>
  );
}
