# Capoeira

Personal archive of Capoeira study notes: songs, toques, training, history, and class organization.

Material is in Portuguese, French, and English. It is a working notebook, not a textbook.

**Roda Caderno** is the local companion app on top of this archive. It structures what is already in the repo. It does not invent songs, people, lyrics, or history.

## Contents

```
data/
  Capoeira_Knowledge_Base.docx      compiled notes
  Capoeira_Master_Song_Index_v2.xlsx song index
  Keep/                             Google Keep export
```

### `data/Keep`

Each Keep note is stored as:

- `.json` — original export (title, labels, body)
- `.html` — readable copy of the same note

Notes cover:

- **Canções** — corridos, quadras, ladainhas, Maculelê; lists of songs to learn and to lead
- **Toques** — Angola, Regional, Contemporânea, Ijexá, berimbau / pandeiro / atabaque
- **Jogo** — movimentos, acrobacias, treinos, sequences
- **História** — mestres, lineage, vocabulary, research topics
- **Grupo** — events, formatura, class notes

Keep labels used in the export: `Canção`, `Aprender`, `Ladainha`, `Quadras`, `Acrobacias`, `Angola`, `Regional`, `Contemporanea`, `HistoriaDaCapoeira`, `Capoeira`.

## Run Roda Caderno

Requires Docker. The app binds `0.0.0.0:3847`.

```bash
cp .env.example .env
docker compose up --build
```

Compose waits for Postgres, runs migrations, imports `./data`, then starts Next.js.

Expected import counts (approximate):

- 165 songs (Clean Master Index)
- 70 Keep JSON notes
- 319 spreadsheet rows
- ~125–140 research/queue items
- 1 docx

Re-running `npm run import` skips duplicates.

Manual steps if you already have Node:

```bash
docker compose up db -d
npx prisma migrate deploy
npm run import
npm run dev
```

## License

Personal notes. Songs and historical material belong to the Capoeira tradition and their original authors; this repo only records how they were collected and studied.
