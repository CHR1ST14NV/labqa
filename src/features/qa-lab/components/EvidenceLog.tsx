"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Copy, FileJson, FileSpreadsheet, Trash2 } from "lucide-react";
import { Panel, PassFailPill, SectionHeader, SegmentedControl } from "./kit";
import {
  copyEvidenceToClipboard,
  downloadEvidenceAsCsv,
  downloadEvidenceAsJson,
} from "../testing/evidence";
import { useQaLab } from "../state/QaLabContext";

type Filter = "all" | "pass" | "fail";

export function EvidenceLog() {
  const { evidence, clearEvidence } = useQaLab();
  const [filter, setFilter] = useState<Filter>("all");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    try {
      await copyEvidenceToClipboard(evidence);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  // FALLIDA primero, luego más reciente primero — puramente de presentación.
  const sorted = useMemo(() => {
    return [...evidence].sort((a, b) => {
      if (a.result !== b.result) return a.result === "FAIL" ? -1 : 1;
      return b.timestamp.localeCompare(a.timestamp);
    });
  }, [evidence]);

  const filtered = sorted.filter((entry) => {
    if (filter === "pass") return entry.result === "PASS";
    if (filter === "fail") return entry.result === "FAIL";
    return true;
  });

  return (
    <Panel padded={false}>
      <div className="p-6 pb-0">
        <SectionHeader
          eyebrow="Evidencia"
          title={`${evidence.length} registros de ejecución`}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} disabled={evidence.length === 0} className="gap-1.5">
                {copyState === "copied" ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copyState === "copied" ? "Copiado" : copyState === "error" ? "No se pudo copiar" : "Copiar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadEvidenceAsJson(evidence)}
                disabled={evidence.length === 0}
                className="gap-1.5"
              >
                <FileJson className="h-3.5 w-3.5" /> Descargar JSON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadEvidenceAsCsv(evidence)}
                disabled={evidence.length === 0}
                className="gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Descargar CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearEvidence}
                disabled={evidence.length === 0}
                className="gap-1.5 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          }
        />
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todos" },
            { value: "pass", label: "Aprobadas" },
            { value: "fail", label: "Fallidas" },
          ]}
        />
      </div>

      <div className="mt-4 max-h-[480px] overflow-auto px-6 pb-6">
        <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
          <thead className="sticky top-0 bg-white text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="py-2.5 pr-3">Fecha y hora</th>
              <th className="px-3 py-2.5">Caso</th>
              <th className="px-3 py-2.5">Regla</th>
              <th className="px-3 py-2.5">Entrada</th>
              <th className="px-3 py-2.5">Esperado</th>
              <th className="px-3 py-2.5">Obtenido</th>
              <th className="px-3 py-2.5">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                  Sin evidencia todavía — ejecutá una suite en Ejecución.
                </td>
              </tr>
            ) : (
              filtered.map((entry, index) => (
                <tr
                  key={`${entry.testCaseId}-${entry.timestamp}-${index}`}
                  className={`border-t border-slate-50 ${entry.result === "FAIL" ? "bg-rose-50/60" : ""}`}
                >
                  <td className="py-2 pr-3 font-mono text-[11px] text-slate-400">
                    {new Date(entry.timestamp).toLocaleTimeString("es-GT")}
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-slate-700">{entry.testCaseId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{entry.ruleId}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{entry.input}</td>
                  <td className="px-3 py-2 text-xs">{entry.expected}</td>
                  <td className="px-3 py-2 text-xs">{entry.actual}</td>
                  <td className="px-3 py-2">
                    <PassFailPill pass={entry.result === "PASS"} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
