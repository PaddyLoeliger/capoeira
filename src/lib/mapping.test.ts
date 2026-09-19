import { describe, expect, it } from "vitest";
import { mapLearningStatus, mapVerification, parseFormStyle } from "./mapping";

describe("conservative mappings", () => {
  it("maps mixed learning cells to Learning with a note", () => {
    const mapped = mapLearningStatus("Repertoire / To learn");
    expect(mapped.status).toBe("LEARNING");
    expect(mapped.note).toContain("mixed");
  });

  it("does not treat High as historically verified", () => {
    const mapped = mapVerification("High");
    expect(mapped.kind).toBe("EXTERNAL_SOURCE");
    expect(mapped.needsHumanReview).toBe(true);
  });

  it("splits form and tradition without inventing values", () => {
    const mapped = parseFormStyle("Corrido / Angola | Corrido");
    expect(mapped.form).toBe("Corrido");
    expect(mapped.tradition).toBe("Angola");
  });
});
