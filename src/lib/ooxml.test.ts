import { describe, expect, it } from "vitest";
import { parseNamespacedSheetXml } from "./ooxml";

describe("OOXML sheet parser", () => {
  it("does not let empty self-closing cells swallow the next cell value", () => {
    const xml = `<?xml version="1.0"?><x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:sheetData>
      <x:row r="1">
        <x:c r="A1" t="str"><x:v>Canonical song / fragment</x:v></x:c>
        <x:c r="B1" t="str"><x:v>Form / style</x:v></x:c>
        <x:c r="C1" t="str"><x:v>Learning status</x:v></x:c>
      </x:row>
      <x:row r="2">
        <x:c r="A2" t="str"><x:v>A canoa virou marinheiro</x:v></x:c>
        <x:c r="B2" t="str" />
        <x:c r="C2" t="str"><x:v>To learn</x:v></x:c>
      </x:row>
    </x:sheetData></x:worksheet>`;
    const rows = parseNamespacedSheetXml(xml);
    expect(rows).toHaveLength(1);
    expect(rows[0]["Canonical song / fragment"]).toBe("A canoa virou marinheiro");
    expect(rows[0]["Form / style"]).toBe("");
    expect(rows[0]["Learning status"]).toBe("To learn");
  });
});
