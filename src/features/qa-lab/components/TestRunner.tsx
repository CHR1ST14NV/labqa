"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, PlayCircle } from "lucide-react";
import { Metric, Panel, PassFailPill, SectionHeader, TechniquePill } from "./kit";
import { useQaLab } from "../state/QaLabContext";

export function TestRunner() {
  const { lastRunReport, runSuite, defectModeEnabled, presentationMode } = useQaLab();
  const hasFailures = Boolean(lastRunReport && lastRunReport.metrics.failed > 0);
  const firstFailure = lastRunReport?.results.find((result) => !result.pass) ?? null;

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeader eyebrow="Ejecución" title="Ejecución de Pruebas" />
        <div className="flex flex-wrap gap-2.5">
          <Button size="lg" onClick={() => runSuite("ESTADOS")} className="gap-2">
            <PlayCircle className="h-[18px] w-[18px]" /> Ejecutar Transición de Estados
          </Button>
          <Button size="lg" variant="secondary" onClick={() => runSuite("DECISION")} className="gap-2">
            <PlayCircle className="h-[18px] w-[18px]" /> Ejecutar Tabla de Decisiones
          </Button>
          <Button size="lg" variant="outline" onClick={() => runSuite("ALL")} className="gap-2">
            <PlayCircle className="h-[18px] w-[18px]" /> Ejecutar Todas las Pruebas
          </Button>
        </div>

        {!defectModeEnabled ? (
          <p className="mt-4 text-xs font-semibold text-emerald-600">● Sistema sin defectos inyectados</p>
        ) : (
          <p className="mt-4 text-xs font-semibold text-rose-600">
            ● Inyección de defecto activa — el comportamiento de T11 fue alterado deliberadamente
          </p>
        )}
      </Panel>

      {lastRunReport ? (
        <>
          {hasFailures ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-900 shadow-sm">
              <AlertTriangle className="h-7 w-7 shrink-0 text-rose-600" />
              <p className="text-sm font-bold">
                {lastRunReport.metrics.failed} caso(s) en FALLIDA — revisá la tabla de resultados abajo.
              </p>
            </div>
          ) : null}

          <Panel>
            <div
              className={`grid grid-cols-2 gap-6 sm:grid-cols-4 ${presentationMode ? "sm:grid-cols-4" : ""}`}
            >
              <Metric label="Total" value={lastRunReport.metrics.total} big={presentationMode} />
              <Metric
                label="Aprobadas"
                value={lastRunReport.metrics.passed}
                tone="green"
                emphasis={!hasFailures}
                big={presentationMode}
              />
              <Metric
                label="Fallidas"
                value={lastRunReport.metrics.failed}
                tone={hasFailures ? "red" : "neutral"}
                emphasis={hasFailures}
                big={presentationMode}
              />
              <Metric label="% Aprobación" value={`${lastRunReport.metrics.passRatePercent}%`} big={presentationMode} />
            </div>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasFailures ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${lastRunReport.metrics.passRatePercent}%` }}
              />
            </div>
          </Panel>

          {firstFailure ? (
            <Panel className="border-rose-200 bg-rose-50/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-lg font-bold text-rose-800">{firstFailure.id} — FALLIDA</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Esperado
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{firstFailure.expected}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Obtenido
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-rose-700">{firstFailure.actual}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-rose-700">
                    Diferencia: la transición viola la regla {firstFailure.ruleId}.
                  </p>
                </div>
              </div>
            </Panel>
          ) : null}

          <Panel padded={false}>
            <div className="p-6 pb-0">
              <SectionHeader title="Resultados" />
            </div>
            <div className="max-h-[440px] overflow-auto px-6 pb-6">
              <table className="w-full min-w-[760px] border-collapse text-left text-[13.5px]">
                <thead className="sticky top-0 bg-white text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="py-2.5 pr-3">Caso</th>
                    <th className="px-3 py-2.5">Técnica</th>
                    <th className="px-3 py-2.5">Esperado</th>
                    <th className="px-3 py-2.5">Obtenido</th>
                    <th className="px-3 py-2.5">Regla</th>
                    <th className="px-3 py-2.5">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRunReport.results.map((result) => (
                    <tr
                      key={`${result.id}-${result.timestamp}`}
                      className={`border-t border-slate-50 ${!result.pass ? "bg-rose-50/70" : ""}`}
                    >
                      <td className="py-2.5 pr-3 font-mono text-xs font-bold text-slate-700">
                        {result.id}
                      </td>
                      <td className="px-3 py-2.5">
                        <TechniquePill technique={result.technique} />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">{result.expected}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">{result.actual}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{result.ruleId}</td>
                      <td className="px-3 py-2.5">
                        <PassFailPill pass={result.pass} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : (
        <Panel className="border-dashed text-center text-sm text-slate-400">
          Ejecutá una suite arriba para ver resultados.
        </Panel>
      )}
    </div>
  );
}
