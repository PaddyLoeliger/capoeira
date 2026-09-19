import { XMLParser } from "fast-xml-parser";

export type SheetRow = Record<string, string>;

function colLetters(ref: string): string {
  return ref.replace(/[0-9]/g, "");
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function cellText(cell: Record<string, unknown>): string {
  if (!cell || typeof cell !== "object") return "";
  const v = cell["x:v"] ?? cell.v;
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return String((v as { "#text"?: string })["#text"] ?? "");
  return String(v);
}

export function parseNamespacedSheetXml(xml: string): SheetRow[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    isArray: (name) => name === "x:row" || name === "x:c" || name === "row" || name === "c",
  });
  const doc = parser.parse(xml);
  const worksheet = doc["x:worksheet"] ?? doc.worksheet;
  const sheetData = worksheet?.["x:sheetData"] ?? worksheet?.sheetData;
  const rows = asArray(sheetData?.["x:row"] ?? sheetData?.row);
  if (rows.length === 0) return [];

  const headerRow = rows[0];
  const headerCells = asArray(headerRow["x:c"] ?? headerRow.c);
  const headers: Record<string, string> = {};
  for (const cell of headerCells) {
    const ref = String(cell["@_r"] ?? "");
    const col = colLetters(ref);
    headers[col] = cellText(cell).trim();
  }

  const out: SheetRow[] = [];
  for (const row of rows.slice(1)) {
    const cells = asArray(row["x:c"] ?? row.c);
    const record: SheetRow = {};
    let hasValue = false;
    for (const cell of cells) {
      const ref = String(cell["@_r"] ?? "");
      const col = colLetters(ref);
      const header = headers[col] ?? col;
      const text = cellText(cell);
      record[header] = text;
      if (text.trim()) hasValue = true;
    }
    if (hasValue) out.push(record);
  }
  return out;
}

export function parseWorkbookSheetNames(xml: string): { name: string; rId: string }[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const doc = parser.parse(xml);
  const workbook = doc["x:workbook"] ?? doc.workbook;
  const sheets = workbook?.["x:sheets"] ?? workbook?.sheets;
  const list = asArray(sheets?.["x:sheet"] ?? sheets?.sheet);
  return list.map((sheet) => ({
    name: String(sheet["@_name"] ?? ""),
    rId: String(sheet["@_r:id"] ?? sheet["@_id"] ?? ""),
  }));
}

export function parseWorkbookRels(xml: string): Record<string, string> {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const doc = parser.parse(xml);
  const rels = asArray(doc.Relationships?.Relationship);
  const map: Record<string, string> = {};
  for (const rel of rels) {
    map[String(rel["@_Id"])] = String(rel["@_Target"]).replace(/^\//, "");
  }
  return map;
}
