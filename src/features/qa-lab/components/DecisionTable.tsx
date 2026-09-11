"use client";

import { useMemo, useState } from "react";
import {
  InspectorPanel,
  InspectorRow,
  Panel,
  PassFailPill,
  SectionHeader,
} from "./kit";
import { evaluateDecision } from "../domain/decision-table/decisionEngine";
import { DECISION_RULES } from "../domain/decision-table/rules";
import { CONDITION_LABELS } from "../domain/decision-table/types";

export function DecisionTable() {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(DECISION_RULES[0]?.id ?? "");

  const selectedRule = useMemo(
    () => DECISION_RULES.find((rule) => rule.id === selectedRuleId) ?? null,
    [selectedRuleId],
  );

  const recomputed = selectedRule ? evaluateDecision(selectedRule.conditions) : null;
  const conditionKeys = Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>;
  const conditionShort: Record<keyof typeof CONDITION_LABELS, string> = {
    vip: "VIP",
    amountGte500: "≥Q500",
    couponValid: "Cupón",
    allowsPromotions: "Promos",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
      <Panel padded={false} className="overflow-hidden">
        <div className="p-6 pb-0">
          <SectionHeader eyebrow="Motor de reglas" title="Tabla de Decisiones" />
        </div>
        <div className="max-h-[520px] overflow-auto px-6 pb-6">
          <table className="w-full min-w-[520px] border-collapse text-left text-[13.5px]">
            <thead className="sticky top-0 bg-white text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2.5 pr-3">Regla</th>
                {conditionKeys.map((key) => (
                  <th key={key} className="px-2 py-2.5 text-center">
                    {conditionShort[key]}
                  </th>
                ))}
                <th className="px-2 py-2.5 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {DECISION_RULES.map((rule) => {
                const active = rule.id === selectedRuleId;
                return (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`cursor-pointer border-t border-slate-50 transition-colors ${
                      active ? "bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                          active ? "bg-blue-600 text-white" : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        {rule.id}
                      </span>
                    </td>
                    {conditionKeys.map((key) => (
                      <td key={key} className="px-2 py-2 text-center">
                        {rule.conditions[key] ? (
                          <span className="font-bold text-emerald-600">●</span>
                        ) : (
                          <span className="text-slate-200">○</span>
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right font-bold text-slate-700">
                      {rule.actions.discountPercent}%
                      {rule.actions.rejectCoupon ? (
                        <span className="ml-1 text-rose-500">✕</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {selectedRule ? (
        <InspectorPanel eyebrow="Detalle de la Regla" title={selectedRule.id}>
          <div className="space-y-0">
            {conditionKeys.map((key) => (
              <InspectorRow
                key={key}
                label={CONDITION_LABELS[key]}
                value={selectedRule.conditions[key] ? "Sí" : "No"}
              />
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Esperado</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {selectedRule.actions.discountPercent}%
            </p>
            {selectedRule.actions.rejectCoupon ? (
              <p className="mt-1 text-xs font-bold text-rose-600">Cupón rechazado</p>
            ) : null}
          </div>

          <div className="mt-3 rounded-2xl bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Obtenido (motor)
              </p>
              <PassFailPill
                size="sm"
                pass={
                  recomputed?.discountPercent === selectedRule.actions.discountPercent &&
                  recomputed?.rejectCoupon === selectedRule.actions.rejectCoupon
                }
              />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {recomputed?.discountPercent}%
            </p>
            {recomputed?.rejectCoupon ? (
              <p className="mt-1 text-xs font-bold text-rose-600">Cupón rechazado</p>
            ) : null}
          </div>
        </InspectorPanel>
      ) : null}
    </div>
  );
}
