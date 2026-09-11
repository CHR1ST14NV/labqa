import { TestRunResult } from "./testRunner";

export interface EvidenceEntry {
  timestamp: string;
  testCaseId: string;
  technique: string;
  ruleId: string;
  input: string;
  expected: string;
  actual: string;
  result: "PASS" | "FAIL";
  details: string;
}

export function toEvidence(results: TestRunResult[]): EvidenceEntry[] {
  return results.map((result) => ({
    timestamp: result.timestamp,
    testCaseId: result.id,
    technique: result.technique,
    ruleId: result.ruleId,
    input: result.input,
    expected: result.expected,
    actual: result.actual,
    result: result.pass ? "PASS" : "FAIL",
    details: result.details,
  }));
}

export function evidenceToJson(entries: EvidenceEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

const CSV_COLUMNS: Array<keyof EvidenceEntry> = [
  "timestamp",
  "testCaseId",
  "technique",
  "ruleId",
  "input",
  "expected",
  "actual",
  "result",
  "details",
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function evidenceToCsv(entries: EvidenceEntry[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = entries.map((entry) =>
    CSV_COLUMNS.map((column) => csvEscape(String(entry[column]))).join(","),
  );
  return [header, ...rows].join("\n");
}

// Todo lo de abajo corre en el navegador del usuario; no hay backend
// involucrado en generar ni exportar evidencia.
export async function copyEvidenceToClipboard(entries: EvidenceEntry[]): Promise<void> {
  const text = evidenceToJson(entries);
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("El portapapeles no está disponible en este navegador.");
}

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadEvidenceAsJson(entries: EvidenceEntry[]): void {
  downloadTextFile(
    `qa-lab-evidencia-${Date.now()}.json`,
    evidenceToJson(entries),
    "application/json",
  );
}

export function downloadEvidenceAsCsv(entries: EvidenceEntry[]): void {
  downloadTextFile(`qa-lab-evidencia-${Date.now()}.csv`, evidenceToCsv(entries), "text/csv");
}
