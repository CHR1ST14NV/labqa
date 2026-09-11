"use client";

import { Panel, SectionHeader, Timeline } from "../../qa-lab/components/kit";
import { useDemoStore } from "../state/DemoStoreContext";

// Comportamiento normal del módulo — NO es evidencia de pruebas. El kit
// Timeline usa un check/! genérico en vez de un badge grande "Aceptada" por
// línea, reservando ese vocabulario para cuando realmente aporta (ver
// OrderLifecycle / mensajes de rechazo).
export function OrderTimeline() {
  const { order, timeline } = useDemoStore();
  if (!order) return null;

  return (
    <Panel>
      <SectionHeader eyebrow="Actividad reciente" title="Historial" />
      <Timeline
        emptyLabel="Todavía no hay eventos para este pedido."
        items={timeline.map((entry, index) => ({
          key: `${entry.time}-${index}`,
          time: entry.time,
          ok: entry.accepted,
          title: entry.accepted
            ? `${entry.eventLabel} → ${entry.resultingStateLabel}`
            : `${entry.eventLabel} rechazado`,
          detail: entry.accepted
            ? `${entry.previousStateLabel} → ${entry.resultingStateLabel}`
            : entry.message,
        }))}
      />
    </Panel>
  );
}
