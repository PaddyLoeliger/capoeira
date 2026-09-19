"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { findExactSongMatch } from "@/lib/exact-title";

async function loadSongs() {
  return prisma.song.findMany({
    select: { id: true, title: true, aliases: { select: { alias: true } } },
  });
}

export async function attachKeepNote(keepNoteId: string) {
  const note = await prisma.rawKeepNote.findUnique({ where: { id: keepNoteId } });
  if (!note) throw new Error("Keep note not found");

  const match = findExactSongMatch(note.title, await loadSongs());
  if (!match) {
    throw new Error("No exact title or alias match. Close spellings are not attached.");
  }

  await prisma.$transaction([
    prisma.keepNoteLink.upsert({
      where: { keepNoteId_songId: { keepNoteId, songId: match.songId } },
      update: { via: match.via },
      create: { keepNoteId, songId: match.songId, via: match.via },
    }),
    prisma.rawKeepNote.update({
      where: { id: keepNoteId },
      data: { reviewStatus: "attached", reviewedAt: new Date() },
    }),
    prisma.extractionCandidate.updateMany({
      where: { keepNoteId, status: "pending" },
      data: { status: "attached" },
    }),
  ]);

  revalidatePath("/review");
  revalidatePath("/dashboard");
  revalidatePath(`/songs/${match.songId}`);
  revalidatePath("/songs/unidentified");
}

export async function rejectKeepNote(keepNoteId: string) {
  await prisma.$transaction([
    prisma.rawKeepNote.update({
      where: { id: keepNoteId },
      data: { reviewStatus: "rejected", reviewedAt: new Date() },
    }),
    prisma.extractionCandidate.updateMany({
      where: { keepNoteId, status: "pending" },
      data: { status: "rejected" },
    }),
  ]);
  revalidatePath("/review");
  revalidatePath("/dashboard");
  revalidatePath("/songs/unidentified");
}

export async function restoreKeepNote(keepNoteId: string) {
  await prisma.rawKeepNote.update({
    where: { id: keepNoteId },
    data: { reviewStatus: "pending", reviewedAt: null },
  });
  await prisma.extractionCandidate.updateMany({
    where: { keepNoteId },
    data: { status: "pending" },
  });
  revalidatePath("/review");
  revalidatePath("/dashboard");
}
