export type LearningStatus = "COMFORTABLE" | "TO_LEARN" | "LEARNING" | "UNKNOWN";
export type VerificationKind =
  | "UNVERIFIED"
  | "KEEP_ONLY"
  | "MEDIUM"
  | "EXTERNAL_SOURCE"
  | "NEEDS_VERIFICATION";

export function mapLearningStatus(raw: string | undefined): {
  status: LearningStatus;
  note: string | null;
} {
  const value = (raw ?? "").trim();
  if (!value) return { status: "UNKNOWN", note: null };

  const lower = value.toLowerCase();
  const hasRepertoire = /\brepertoire\b/.test(lower);
  const hasToLearn = /to learn/.test(lower);
  const mixed = /[|/]/.test(value) || (hasRepertoire && hasToLearn);

  if (mixed) {
    return { status: "LEARNING", note: `Mapped from mixed cell: ${value}` };
  }
  if (hasToLearn) return { status: "TO_LEARN", note: null };
  if (hasRepertoire) return { status: "COMFORTABLE", note: value === "Repertoire" ? null : `Mapped from: ${value}` };
  return { status: "LEARNING", note: `Mapped from: ${value}` };
}

export function mapVerification(raw: string | undefined): {
  kind: VerificationKind;
  needsHumanReview: boolean;
} {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "high") {
    return { kind: "EXTERNAL_SOURCE", needsHumanReview: true };
  }
  if (value === "medium") {
    return { kind: "NEEDS_VERIFICATION", needsHumanReview: true };
  }
  if (value === "keep only") {
    return { kind: "KEEP_ONLY", needsHumanReview: true };
  }
  return { kind: "UNVERIFIED", needsHumanReview: true };
}

export function parseFormStyle(raw: string | undefined): {
  form: string | null;
  tradition: string | null;
} {
  const first = (raw ?? "").split("|")[0]?.trim() ?? "";
  if (!first) return { form: null, tradition: null };
  const parts = first.split(/[/;]/).map((p) => p.trim()).filter(Boolean);
  const formTokens = ["corrido", "quadra", "ladainha", "corridos", "quadras", "ladainhas"];
  const traditionTokens = ["angola", "regional", "contemporanea", "contemporânea"];
  let form: string | null = null;
  let tradition: string | null = null;
  for (const part of parts) {
    const key = part.toLowerCase();
    if (!form && formTokens.includes(key)) form = part;
    if (!tradition && traditionTokens.includes(key)) tradition = part;
  }
  if (!form && parts[0] && !traditionTokens.includes(parts[0].toLowerCase())) form = parts[0];
  if (!tradition) {
    const found = parts.find((p) => traditionTokens.includes(p.toLowerCase()));
    tradition = found ?? null;
  }
  return { form, tradition };
}

export function splitAliases(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split("|")
    .map((a) => a.trim())
    .filter(Boolean);
}

export function splitTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.startsWith("#"));
}
