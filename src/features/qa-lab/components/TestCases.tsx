"use client";

import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { InspectorRow, Panel, PassFailPill, SectionHeader, SegmentedControl, TechniquePill } from "./kit";
import { STATE_TEST_CASES } from "../domain/state-machine/testCases";
import { ORDER_STATE_LABELS } from "../domain/state-machine/types";
import { DECISION_TEST_CASES } from "../domain/decision-table/testCases";
import { QaTechnique, runDecisionTableSuite, runStateMachineSuite } from "../testing/testRunner";
import { useQaLab } from "../state/QaLabContext";

type Filter = "all" | QaTechnique;

interface Row {
  id: string;
  technique: QaTechnique;
  scenario: string;
  precondition: string;
  input: string;
  expected: string;
  actual: string;
  rule: string;
  pass: boolean;
}

export function TestCases() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const { defectModeEnabled } = useQaLab();

  const stateResults = useMemo(() => runStateMachineSuite(defectModeEnabled), [defectModeEnabled]);
  const decisionResults = useMemo(() => runDecisionTableSuite(), []);

  const rows: Row[] = useMemo(() => {
    const teRows: Row[] = STATE_TEST_CASES.map((testCase, index) => {
      const result = stateResults[index];
      return {
        id: testCase.id,
        technique: "ESTADOS",
        scenario: testCase.name,
        precondition: testCase.precondition,
        input: `${ORDER_STATE_LABELS[testCase.initialState]} + ${testCase.steps.map((s) => s.event).join(" → ")}`,
        expected: result.expected,
        actual: result.actual,
        rule: result.ruleId,
        pass: result.pass,
      };
    });

    const tdRows: Row[] = DECISION_TEST_CASES.map((testCase, index) => {
      const result = decisionResults[index];
      return {
        id: testCase.id,
        technique: "DECISION",
        scenario: `Regla ${testCase.ruleId}`,
        precondition: result.input,
        input: result.input,
        expected: result.expected,
        actual: result.actual,
        rule: testCase.ruleId,
        pass: result.pass,
      };
    });

    return [...teRows, ...tdRows];
  }, [stateResults, decisionResults]);

  const filtered = rows.filter((row) => {
    if (filter !== "all" && row.technique !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return row.id.toLowerCase().includes(q) || row.scenario.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Panel padded={false} className="relative overflow-hidden">
      <div className="p-6 pb-0">
        <SectionHeader eyebrow="Catálogo" title="Casos de Prueba" />
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `Todos · ${rows.length}` },
              { value: "ESTADOS", label: `Transición · ${STATE_TEST_CASES.length}` },
              { value: "DECISION", label: `Decisiones · ${DECISION_TEST_CASES.length}` },
            ]}
          />
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar TE-009…"
              className="h-9 w-56 rounded-full border border-slate-200 bg-white pl-9 pr-3 text-[13px]"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto px-6 pb-6">
        <table className="w-full min-w-[820px] border-collapse text-left text-[13.5px]">
          <thead className="sticky top-0 bg-white text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="py-2.5 pr-3">ID</th>
              <th className="px-3 py-2.5">Técnica</th>
              <th className="px-3 py-2.5">Escenario</th>
              <th className="px-3 py-2.5">Esperado</th>
              <th className="px-3 py-2.5">Regla</th>
              <th className="px-3 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className="cursor-pointer border-t border-slate-50 transition-colors hover:bg-slate-50"
              >
                <td className="py-2.5 pr-3 font-mono text-xs font-bold text-slate-700">{row.id}</td>
                <td className="px-3 py-2.5">
                  <TechniquePill technique={row.technique} />
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-700">{row.scenario}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{row.expected}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{row.rule}</td>
                <td className="px-3 py-2.5">
                  <PassFailPill pass={row.pass} size="sm" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">
                  Ningún caso coincide con la búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-200"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm animate-in overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl duration-200">
            <div className="flex items-start justify-between">
              <div>
                <TechniquePill technique={selected.technique} />
                <h3 className="mt-2 font-mono text-2xl font-bold text-slate-900">{selected.id}</h3>
                <p className="text-sm text-slate-500">{selected.scenario}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-0 rounded-2xl bg-slate-50 p-4">
              <InspectorRow label="Dado" value={selected.precondition} />
              <InspectorRow label="Esperado" value={selected.expected} />
              <InspectorRow label="Obtenido" value={selected.actual} />
              <InspectorRow label="Regla" value={selected.rule} />
            </div>

            <div className="mt-4">
              <PassFailPill pass={selected.pass} />
            </div>
          </div>
        </>
      ) : null}
    </Panel>
  );
}
