-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('COMFORTABLE', 'TO_LEARN', 'LEARNING', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VerificationKind" AS ENUM ('UNVERIFIED', 'KEEP_ONLY', 'MEDIUM', 'EXTERNAL_SOURCE', 'NEEDS_VERIFICATION');

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "form" TEXT,
    "tradition" TEXT,
    "formStyleRaw" TEXT,
    "learningStatus" "LearningStatus" NOT NULL DEFAULT 'UNKNOWN',
    "learningNote" TEXT,
    "instrumentCues" TEXT,
    "attributionNote" TEXT,
    "researchNotes" TEXT,
    "verificationRaw" TEXT,
    "verificationKind" "VerificationKind" NOT NULL DEFAULT 'UNVERIFIED',
    "needsHumanReview" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "occurrences" INTEGER,
    "sourceKeepNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongVersion" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SongVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongAlias" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "SongAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "kind" "VerificationKind" NOT NULL DEFAULT 'EXTERNAL_SOURCE',

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawKeepNote" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "labels" JSONB NOT NULL,
    "textContent" TEXT,
    "listContent" JSONB,
    "rawJson" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawKeepNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractionCandidate" (
    "id" TEXT NOT NULL,
    "keepNoteId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "ExtractionCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpreadsheetRow" (
    "id" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "cells" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,

    CONSTRAINT "SpreadsheetRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchItem" (
    "id" TEXT NOT NULL,
    "workingTitle" TEXT NOT NULL,
    "aliases" TEXT,
    "keepContext" TEXT,
    "learningStatusRaw" TEXT,
    "sourceNotes" TEXT,
    "songId" TEXT,

    CONSTRAINT "ResearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchLegend" (
    "status" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "ResearchLegend_pkey" PRIMARY KEY ("status")
);

-- CreateTable
CREATE TABLE "ArchiveDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "extractedText" TEXT,

    CONSTRAINT "ArchiveDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "stats" JSONB NOT NULL,

    CONSTRAINT "ImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "HistoryNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "heldOn" TIMESTAMP(3),

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,

    CONSTRAINT "SourceRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Song_title_key" ON "Song"("title");
CREATE UNIQUE INDEX "SongVersion_songId_contentHash_key" ON "SongVersion"("songId", "contentHash");
CREATE UNIQUE INDEX "SongAlias_songId_alias_key" ON "SongAlias"("songId", "alias");
CREATE UNIQUE INDEX "Citation_songId_url_key" ON "Citation"("songId", "url");
CREATE UNIQUE INDEX "RawKeepNote_fileName_key" ON "RawKeepNote"("fileName");
CREATE UNIQUE INDEX "ExtractionCandidate_keepNoteId_kind_key" ON "ExtractionCandidate"("keepNoteId", "kind");
CREATE UNIQUE INDEX "SpreadsheetRow_sheetName_rowNumber_key" ON "SpreadsheetRow"("sheetName", "rowNumber");
CREATE UNIQUE INDEX "ResearchItem_workingTitle_sourceNotes_key" ON "ResearchItem"("workingTitle", "sourceNotes");
CREATE UNIQUE INDEX "ArchiveDocument_fileName_key" ON "ArchiveDocument"("fileName");
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");
CREATE UNIQUE INDEX "Movement_name_key" ON "Movement"("name");

CREATE INDEX "Song_title_trgm" ON "Song" USING gin ("title" gin_trgm_ops);
CREATE INDEX "SongAlias_alias_trgm" ON "SongAlias" USING gin ("alias" gin_trgm_ops);

ALTER TABLE "SongVersion" ADD CONSTRAINT "SongVersion_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SongAlias" ADD CONSTRAINT "SongAlias_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExtractionCandidate" ADD CONSTRAINT "ExtractionCandidate_keepNoteId_fkey" FOREIGN KEY ("keepNoteId") REFERENCES "RawKeepNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResearchItem" ADD CONSTRAINT "ResearchItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;
