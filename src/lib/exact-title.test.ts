import { describe, expect, it } from "vitest";
import { findExactSongMatch } from "./exact-title";

const songs = [
  { id: "1", title: "Paranauê", aliases: [{ alias: "Parana uê parana uê parana" }] },
  { id: "2", title: "Beiramar", aliases: [{ alias: "Beiramar io io" }] },
];

describe("exact title matching", () => {
  it("attaches only when the Keep title equals the song title", () => {
    expect(findExactSongMatch("Beiramar", songs)?.songId).toBe("2");
    expect(findExactSongMatch("Beiramar", songs)?.via).toBe("exact_title");
  });

  it("allows an exact recorded alias, not a close spelling", () => {
    expect(findExactSongMatch("Beiramar io io", songs)?.songId).toBe("2");
    expect(findExactSongMatch("Paranaue", songs)).toBeNull();
    expect(findExactSongMatch("paranauê", songs)).toBeNull();
  });

  it("trims whitespace only", () => {
    expect(findExactSongMatch("  Paranauê  ", songs)?.via).toBe("exact_title");
  });
});
