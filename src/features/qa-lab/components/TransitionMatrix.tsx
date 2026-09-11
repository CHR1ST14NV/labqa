"use client";

import { useMemo, useState } from "react";
import { AllowedBlockedPill, FinalPill, GuardPill, Panel, SectionHeader, SegmentedControl } from "./kit";
import { ALL_STATES, isTerminalState } from "../domain/state-machine/states";
import { TRANSITION_RULES } from "../domain/state-machine/transitions";
import { ORDER_EVENT_LABELS, ORDER_STATE_LABELS, OrderState } from "../domain/state-machine/types";

type PermittedFilter = "all" | "permitted" | "rejected";

export function TransitionMatrix() {
  const [stateFilter, setStateFilter] = useState<OrderState | "all">("all");
  const [permittedFilter, setPermittedFilter] = useState<PermittedFilter>("all");
  const [ruleFilter, setRuleFilter] = useState("");

  // Deriva TODO de TRANSITION_RULES — la misma fuente que el motor y el
  // diagrama. Ningún dato se reescribe acá.
  const rows = useMemo(() => {
    return TRANSITION_RULES.filter((rule) => {
      if (stateFilter !== "all" && rule.from !== stateFilter) return false;
      if (permittedFilter === "permitted" && !rule.permitted) return false;
      if (permittedFilter === "rejected" && rule.permitted) return false;
      if (ruleFilter.trim() && !rule.id.toLowerCase().includes(ruleFilter.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [stateFilter, permittedFilter, ruleFilter]);

  return (
    <Panel>
      <SectionHeader
        eyebrow="Motor de reglas"
        title="Matriz de Transición"
        actions={
          <span className="text-xs font-semibold text-slate-400">
            {rows.length} / {TRANSITION_RULES.length}
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SegmentedControl
          value={permittedFilter}
          onChange={setPermittedFilter}
          options={[
            { value: "all", label: "Todas" },
            { value: "permitted", label: "Permitida" },
            { value: "rejected", label: "Bloqueada" },
          ]}
        />
        <select
          className="h-9 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600"
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value as OrderState | "all")}
        >
          <option value="all">Cualquier estado</option>
          {ALL_STATES.map((state) => (
            <option key={state} value={state}>
              {ORDER_STATE_LABELS[state]}
            </option>
          ))}
        </select>
        <input
          className="h-9 w-24 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-mono"
          value={ruleFilter}
          onChange={(event) => setRuleFilter(event.target.value)}
          placeholder="T01…"
        />
      </div>

      <div className="max-h-[440px] overflow-auto rounded-2xl border border-slate-100">
        <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
          <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Desde</th>
              <th className="px-4 py-2.5">Evento</th>
              <th className="px-4 py-2.5">Resultado</th>
              <th className="px-4 py-2.5">Hacia</th>
              <th className="px-4 py-2.5">Regla</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rule) => (
              <tr
                key={rule.id}
                className="cursor-default border-t border-slate-50 transition-colors hover:bg-slate-50/80"
                title={`${rule.guardDescription ? `Condición: ${rule.guardDescription}. ` : ""}${rule.description}`}
              >
                <td className="px-4 py-2.5 font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    {ORDER_STATE_LABELS[rule.from]}
                    {isTerminalState(rule.from) ? <FinalPill /> : null}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                  {ORDER_EVENT_LABELS[rule.event]}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <AllowedBlockedPill permitted={rule.permitted} />
                    {rule.guard ? <GuardPill /> : null}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {ORDER_STATE_LABELS[rule.permitted ? rule.to : rule.from]}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-violet-50 px-2 py-0.5 font-mono text-xs font-bold text-violet-700">
                    {rule.id}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  Ningún registro coincide con estos filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
