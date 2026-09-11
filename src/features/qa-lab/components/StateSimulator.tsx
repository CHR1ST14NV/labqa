"use client";

import { Button } from "@/components/ui/button";
import { AcceptedRejectedPill, InspectorPanel, InspectorRow, Timeline } from "./kit";
import { findRule } from "../domain/state-machine/transitions";
import { ORDER_EVENT_LABELS, ORDER_STATE_LABELS, OrderEvent } from "../domain/state-machine/types";
import { useQaLab } from "../state/QaLabContext";

const ALL_EVENTS = Object.values(OrderEvent);

export function StateSimulator() {
  const {
    currentState,
    validEvents,
    history,
    daysSinceDelivery,
    setDaysSinceDelivery,
    attemptEvent,
    defectModeEnabled,
  } = useQaLab();

  const invalidEvents = ALL_EVENTS.filter((event) => !validEvents.includes(event));
  const requiresReturnContext = validEvents.includes(OrderEvent.REQUEST_RETURN);
  const lastEntry = history[0];

  return (
    <InspectorPanel eyebrow="Simulador" title="Estado actual">
      <p className="text-4xl font-bold tracking-tight text-slate-900">
        {ORDER_STATE_LABELS[currentState]}
      </p>
      {defectModeEnabled ? (
        <p className="mt-2 inline-block rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
          Inyección de defecto activa
        </p>
      ) : null}

      {lastEntry ? (
        <div
          className={`mt-4 rounded-2xl p-4 ${
            lastEntry.pass ? "bg-blue-50/70" : "bg-amber-50/70"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {lastEntry.pass ? "Operación aceptada" : "Operación rechazada"}
            </p>
            <AcceptedRejectedPill accepted={lastEntry.pass} size="sm" />
          </div>
          <p className="mt-1.5 font-mono text-[13px] font-semibold text-slate-700">
            {lastEntry.previousStateLabel} + {lastEntry.eventLabel}
          </p>
          <InspectorRow label="Estado conservado" value={lastEntry.resultingStateLabel} />
          <InspectorRow label="Regla" value={lastEntry.ruleId} />
          {!lastEntry.pass ? <p className="mt-1 text-xs text-slate-500">{lastEntry.message}</p> : null}
        </div>
      ) : null}

      {requiresReturnContext ? (
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
            Días desde la entrega
          </label>
          <input
            type="number"
            min={0}
            className="h-10 w-28 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
            value={daysSinceDelivery}
            onChange={(event) => setDaysSinceDelivery(Number(event.target.value) || 0)}
          />
          <p className="mt-1.5 text-xs text-slate-400">La devolución solo procede si es ≤ 30.</p>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Eventos permitidos</p>
        {validEvents.length === 0 ? (
          <p className="text-sm text-slate-400">Estado terminal — no acepta más eventos.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {validEvents.map((event) => (
              <Button key={event} size="sm" onClick={() => attemptEvent(event)}>
                {ORDER_EVENT_LABELS[event]}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Prueba negativa</p>
        <p className="mb-2 text-xs text-slate-400">Ejecutá un evento que debería ser bloqueado.</p>
        <div className="flex flex-wrap gap-2">
          {invalidEvents.map((event) => {
            const rule = findRule(currentState, event);
            return (
              <Button
                key={event}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-50"
                onClick={() => attemptEvent(event)}
                title={rule ? rule.description : "No existe una regla definida para este caso."}
              >
                {ORDER_EVENT_LABELS[event]}
              </Button>
            );
          })}
        </div>
      </div>

      {history.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            Actividad reciente
          </p>
          <div className="max-h-52 overflow-y-auto">
            <Timeline
              emptyLabel="Todavía no hay actividad."
              items={history.slice(0, 8).map((entry, index) => ({
                key: `${entry.time}-${index}`,
                time: entry.time,
                ok: entry.pass,
                title: `${entry.previousStateLabel} → ${entry.resultingStateLabel}`,
                detail: `${entry.eventLabel} · ${entry.ruleId}`,
              }))}
            />
          </div>
        </div>
      ) : null}
    </InspectorPanel>
  );
}
