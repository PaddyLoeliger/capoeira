export type ExactMatchSong = {
  id: string;
  title: string;
  aliases: { alias: string }[];
};

export type ExactMatch = {
  songId: string;
  songTitle: string;
  via: "exact_title" | "exact_alias";
};

export function normalizeExact(value: string) {
  return value.trim();
}

export function findExactSongMatch(keepTitle: string, songs: ExactMatchSong[]): ExactMatch | null {
  const title = normalizeExact(keepTitle);
  if (!title) return null;

  const byTitle = songs.find((song) => normalizeExact(song.title) === title);
  if (byTitle) {
    return { songId: byTitle.id, songTitle: byTitle.title, via: "exact_title" };
  }

  for (const song of songs) {
    const alias = song.aliases.find((item) => normalizeExact(item.alias) === title);
    if (alias) {
      return { songId: song.id, songTitle: song.title, via: "exact_alias" };
    }
  }

  return null;
}
