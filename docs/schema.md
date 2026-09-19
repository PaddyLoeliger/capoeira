# Schema mappings

Importer reads only files already in `data/`. Keep notes are never auto-promoted to canonical songs.

## Songs

Source: `Capoeira_Master_Song_Index_v2.xlsx` sheet **Clean Master Index**.

| Spreadsheet | Database |
|---|---|
| Canonical song / fragment | `Song.title` (exact, unique, no fuzzy merge) |
| Aliases / merged Keep entries | `SongAlias.alias` (split on `\|`) |
| Form / style | `formStyleRaw`; first token group split into `form` (Corrido/Quadra/Ladainha) and `tradition` (Angola/Regional/Contemporânea) |
| Learning status | `learningStatus` |
| Instrument / entry cues | `instrumentCues` |
| Lyrics from your Keep notes | `SongVersion` (hash identity; never overwritten) |
| Attribution / version note | `attributionNote` |
| Research notes | `researchNotes` |
| Verification | `verificationRaw` + `verificationKind` |
| Source URL | `Citation` |
| Source Keep notes | `sourceKeepNotes` |
| Occurrences | `occurrences` |
| Tags | `tags` (`#...` tokens only) |

### Learning

- `Repertoire` → Comfortable
- `To learn` → To learn
- mixed cells (`/`, `\|`, or both repertoire and to-learn) → Learning + mapping note
- other values (Event repertoire, Objective) → Learning + mapping note

### Verification

High is **not** historically verified:

- High → `EXTERNAL_SOURCE` and `needsHumanReview=true`
- Medium → `NEEDS_VERIFICATION`
- Keep only → `KEEP_ONLY`
- Unverified / empty → `UNVERIFIED`

## Identification Queue

Each data row → `ResearchItem`. `songId` is set only when `Fragment / working title` equals an existing `Song.title`.

## Research Guide

Rows → `ResearchLegend` (status/meaning). Not songs.

## Verified Shortlist

Citations/URLs attached to existing songs by exact title. No new songs.

## Keep JSON

`data/Keep/*.json` → `RawKeepNote` + pending `ExtractionCandidate`. HTML twins are ignored.

Manual review (`/review`) may attach a Keep note to an existing song only when the Keep title equals `Song.title` or a recorded `SongAlias.alias` (trim only). That creates `KeepNoteLink`. It does not create songs and does not copy Keep body text into `SongVersion`.

## Docx

`Capoeira_Knowledge_Base.docx` → `ArchiveDocument` with extracted text for search/display, not as invented history records.

## Search

PostgreSQL `unaccent` + `pg_trgm`. Title and alias `ILIKE` after `unaccent`.
