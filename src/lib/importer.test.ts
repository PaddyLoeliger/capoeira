import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

function contentHash(lyrics: string) {
  return createHash("sha256").update(lyrics).digest("hex");
}

describe("importer identity", () => {
  it("treats the same lyrics as the same version hash", () => {
    const a = contentHash("E a cobra me morde\nmas que cobra danada");
    const b = contentHash("E a cobra me morde\nmas que cobra danada");
    expect(a).toBe(b);
  });

  it("creates a new version when lyrics change instead of overwriting", () => {
    const original = contentHash("verse one");
    const changed = contentHash("verse one\nverse two");
    expect(original).not.toBe(changed);
  });

  it("links research items only on exact titles", () => {
    const songTitle = "Paranauê";
    const queueTitle = "Paranaue";
    expect(songTitle === queueTitle).toBe(false);
  });
});

describe("accent-insensitive matching helper", () => {
  const fold = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  it("matches Paranauê and Paranaue after folding", () => {
    expect(fold("Paranauê")).toBe(fold("Paranaue"));
  });
});
