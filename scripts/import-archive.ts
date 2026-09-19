import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import mammoth from "mammoth";
import { PrismaClient } from "@prisma/client";
import { parseNamespacedSheetXml, parseWorkbookRels, parseWorkbookSheetNames } from "../src/lib/ooxml";
import {
  mapLearningStatus,
  mapVerification,
  parseFormStyle,
  splitAliases,
  splitTags,
} from "../src/lib/mapping";

const prisma = new PrismaClient();

function sha256(input: string | Buffer) {
  return createHash("sha256").update(input).digest("hex");
}

async function importKeep(archiveDir: string) {
  const keepDir = path.join(archiveDir, "Keep");
  const files = (await readdir(keepDir)).filter((f) => f.endsWith(".json"));
  let created = 0;
  let skipped = 0;
  for (const fileName of files) {
    const existing = await prisma.rawKeepNote.findUnique({ where: { fileName } });
    if (existing) {
      skipped += 1;
      continue;
    }
    const raw = await readFile(path.join(keepDir, fileName), "utf8");
    const json = JSON.parse(raw);
    const labels = Array.isArray(json.labels) ? json.labels : [];
    const note = await prisma.rawKeepNote.create({
      data: {
        fileName,
        title: json.title || fileName.replace(/\.json$/i, ""),
        labels,
        textContent: json.textContent ?? null,
        listContent: json.listContent ?? null,
        rawJson: json,
        contentHash: sha256(raw),
      },
    });
    const candidates: { kind: string; payload: object }[] = [];
    if (note.title) candidates.push({ kind: "TITLE", payload: { title: note.title } });
    if (note.textContent) candidates.push({ kind: "BODY", payload: { text: note.textContent } });
    if (labels.length) candidates.push({ kind: "LABELS", payload: { labels } });
    if (Array.isArray(json.annotations)) {
      candidates.push({ kind: "ANNOTATIONS", payload: { annotations: json.annotations } });
    }
    for (const candidate of candidates) {
      await prisma.extractionCandidate.create({
        data: {
          keepNoteId: note.id,
          kind: candidate.kind,
          payload: candidate.payload,
          status: "pending",
        },
      });
    }
    created += 1;
  }
  return { files: files.length, created, skipped };
}

async function loadXlsxSheets(filePath: string) {
  const buf = await readFile(filePath);
  const zip = await JSZip.loadAsync(buf);
  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
  const names = parseWorkbookSheetNames(workbookXml);
  const rels = parseWorkbookRels(relsXml);
  const sheets: { name: string; rows: ReturnType<typeof parseNamespacedSheetXml> }[] = [];
  for (const sheet of names) {
    const target = rels[sheet.rId];
    const xml = await zip.file(target)!.async("string");
    sheets.push({ name: sheet.name, rows: parseNamespacedSheetXml(xml) });
  }
  return sheets;
}

async function storeSpreadsheetRows(
  sheets: { name: string; rows: Record<string, string>[] }[],
) {
  let created = 0;
  let skipped = 0;
  for (const sheet of sheets) {
    let rowNumber = 2;
    for (const cells of sheet.rows) {
      const contentHash = sha256(JSON.stringify(cells));
      const existing = await prisma.spreadsheetRow.findUnique({
        where: { sheetName_rowNumber: { sheetName: sheet.name, rowNumber } },
      });
      if (existing) skipped += 1;
      else {
        await prisma.spreadsheetRow.create({
          data: { sheetName: sheet.name, rowNumber, cells, contentHash },
        });
        created += 1;
      }
      rowNumber += 1;
    }
  }
  return { created, skipped, total: created + skipped };
}

async function importMasterIndex(rows: Record<string, string>[]) {
  let created = 0;
  let skipped = 0;
  let lyricVersions = 0;
  for (const row of rows) {
    const title = row["Canonical song / fragment"]?.trim();
    if (!title) continue;
    const existing = await prisma.song.findUnique({ where: { title } });
    if (existing) {
      skipped += 1;
      const lyrics = row["Lyrics from your Keep notes"]?.trim();
      if (lyrics) {
        const contentHash = sha256(lyrics);
        const version = await prisma.songVersion.findUnique({
          where: { songId_contentHash: { songId: existing.id, contentHash } },
        });
        if (!version) {
          await prisma.songVersion.create({
            data: {
              songId: existing.id,
              lyrics,
              contentHash,
              source: "KEEP_SPREADSHEET",
            },
          });
          lyricVersions += 1;
        }
      }
      continue;
    }
    const learning = mapLearningStatus(row["Learning status"]);
    const verification = mapVerification(row.Verification);
    const formStyle = parseFormStyle(row["Form / style"]);
    const song = await prisma.song.create({
      data: {
        title,
        form: formStyle.form,
        tradition: formStyle.tradition,
        formStyleRaw: row["Form / style"] || null,
        learningStatus: learning.status,
        learningNote: learning.note,
        instrumentCues: row["Instrument / entry cues"] || null,
        attributionNote: row["Attribution / version note"] || null,
        researchNotes: row["Research notes"] || null,
        verificationRaw: row.Verification || null,
        verificationKind: verification.kind,
        needsHumanReview: verification.needsHumanReview,
        tags: splitTags(row.Tags),
        occurrences: row.Occurrences ? Number(row.Occurrences) : null,
        sourceKeepNotes: row["Source Keep notes"] || null,
      },
    });
    created += 1;
    for (const alias of splitAliases(row["Aliases / merged Keep entries"])) {
      await prisma.songAlias.create({
        data: { songId: song.id, alias },
      });
    }
    const lyrics = row["Lyrics from your Keep notes"]?.trim();
    if (lyrics) {
      await prisma.songVersion.create({
        data: {
          songId: song.id,
          lyrics,
          contentHash: sha256(lyrics),
          source: "KEEP_SPREADSHEET",
        },
      });
      lyricVersions += 1;
    }
    const url = row["Source URL"]?.trim();
    if (url) {
      await prisma.citation.create({
        data: {
          songId: song.id,
          url,
          note: row["Research notes"] || null,
          kind: verification.kind,
        },
      });
    }
  }
  return { created, skipped, lyricVersions };
}

async function importQueue(rows: Record<string, string>[]) {
  let created = 0;
  let skipped = 0;
  let linked = 0;
  for (const row of rows) {
    const workingTitle = row["Fragment / working title"]?.trim();
    if (!workingTitle) continue;
    const sourceNotes = row["Source notes"] ?? "";
    const existing = await prisma.researchItem.findUnique({
      where: { workingTitle_sourceNotes: { workingTitle, sourceNotes } },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    const song = await prisma.song.findUnique({ where: { title: workingTitle } });
    await prisma.researchItem.create({
      data: {
        workingTitle,
        aliases: row.Aliases || null,
        keepContext: row["Keep context"] || null,
        learningStatusRaw: row["Learning status"] || null,
        sourceNotes,
        songId: song?.id ?? null,
      },
    });
    created += 1;
    if (song) linked += 1;
  }
  return { created, skipped, linked };
}

async function importShortlist(rows: Record<string, string>[]) {
  let attached = 0;
  let unmatched = 0;
  for (const row of rows) {
    const title = row.Song?.trim();
    if (!title) continue;
    const song = await prisma.song.findUnique({ where: { title } });
    if (!song) {
      unmatched += 1;
      continue;
    }
    const url = row["Source URL"]?.trim();
    if (url) {
      await prisma.citation.upsert({
        where: { songId_url: { songId: song.id, url } },
        update: {},
        create: {
          songId: song.id,
          url,
          note: row["Research note"] || null,
          kind: mapVerification(row.Verification).kind,
        },
      });
      attached += 1;
    }
  }
  return { attached, unmatched };
}

async function importGuide(rows: Record<string, string>[]) {
  let upserted = 0;
  for (const row of rows) {
    const status = row.Status?.trim();
    if (!status) continue;
    await prisma.researchLegend.upsert({
      where: { status },
      update: { meaning: row.Meaning ?? "" },
      create: { status, meaning: row.Meaning ?? "" },
    });
    upserted += 1;
  }
  return { upserted };
}

async function importDocx(archiveDir: string) {
  const files = (await readdir(archiveDir)).filter((f) => f.toLowerCase().endsWith(".docx"));
  let created = 0;
  for (const fileName of files) {
    const existing = await prisma.archiveDocument.findUnique({ where: { fileName } });
    if (existing) continue;
    const buf = await readFile(path.join(archiveDir, fileName));
    const extracted = await mammoth.extractRawText({ buffer: buf });
    await prisma.archiveDocument.create({
      data: {
        fileName,
        kind: "DOCX",
        sha256: sha256(buf),
        extractedText: extracted.value,
      },
    });
    created += 1;
  }
  return { files: files.length, created };
}

async function main() {
  const archiveDir = path.resolve(process.env.ARCHIVE_DIR ?? "./data");
  const started = await prisma.importRun.create({ data: { stats: {} } });
  const keep = await importKeep(archiveDir);
  const xlsxPath = path.join(archiveDir, "Capoeira_Master_Song_Index_v2.xlsx");
  const sheets = await loadXlsxSheets(xlsxPath);
  const sheetRows = await storeSpreadsheetRows(sheets);
  const byName = Object.fromEntries(sheets.map((s) => [s.name, s.rows]));
  const master = await importMasterIndex(byName["Clean Master Index"] ?? []);
  const queue = await importQueue(byName["Identification Queue"] ?? []);
  const shortlist = await importShortlist(byName["Verified Shortlist"] ?? []);
  const guide = await importGuide(byName["Research Guide"] ?? []);
  const docx = await importDocx(archiveDir);
  const stats = {
    keep,
    spreadsheetRows: sheetRows,
    master,
    queue,
    shortlist,
    guide,
    docx,
    counts: {
      songs: await prisma.song.count(),
      keepNotes: await prisma.rawKeepNote.count(),
      spreadsheetRows: await prisma.spreadsheetRow.count(),
      researchItems: await prisma.researchItem.count(),
      documents: await prisma.archiveDocument.count(),
      lyricVersions: await prisma.songVersion.count(),
    },
  };
  await prisma.importRun.update({
    where: { id: started.id },
    data: { finishedAt: new Date(), stats },
  });
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
