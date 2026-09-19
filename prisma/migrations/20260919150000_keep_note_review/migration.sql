-- AlterTable
ALTER TABLE "RawKeepNote" ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "RawKeepNote" ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KeepNoteLink" (
    "id" TEXT NOT NULL,
    "keepNoteId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "via" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeepNoteLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KeepNoteLink_keepNoteId_songId_key" ON "KeepNoteLink"("keepNoteId", "songId");
ALTER TABLE "KeepNoteLink" ADD CONSTRAINT "KeepNoteLink_keepNoteId_fkey" FOREIGN KEY ("keepNoteId") REFERENCES "RawKeepNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KeepNoteLink" ADD CONSTRAINT "KeepNoteLink_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
