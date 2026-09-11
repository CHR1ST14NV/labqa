"use client";

import { Button } from "@/components/ui/button";
import { Panel, SectionHeader } from "../../qa-lab/components/kit";
import { ORDER_EVENT_LABELS, OrderEvent, OrderState } from "../../qa-lab/domain/state-machine/types";
import { useDemoStore } from "../state/DemoStoreContext";

// Copy de producto por estado — puramente presentacional. Los botones que
// realmente aparecen salen de validEvents (validEventsFrom en el motor);
// este mapa solo decide el título de la pregunta, nunca qué está permitido.
const QUESTION_BY_STATE: Partial<Record<OrderState, string>> = {
  [OrderState.CREATED]: "¿Confirmamos el pedido?",
  [OrderState.PAYMENT_PENDING]: "¿Qué ocurrió con el pago?",
  [OrderState.PAID]: "¿Iniciamos la preparación?",
  [OrderState.PREPARING]: "¿Despachamos el pedido?",
  [OrderState.SHIPPED]: "¿Confirmamos la entrega?",
  [OrderState.DELIVERED]: "¿El cliente solicita devolución?",
  [OrderState.RETURN_REQUESTED]: "¿Aprobamos la devolución?",
};

export function OrderLifecycle() {
  const { order, validEvents, attemptEvent, daysSinceDelivery, setDaysSinceDelivery } =
    useDemoStore();

  if (!order) return null;

  const requiresReturnContext =
    order.state === OrderState.DELIVERED && validEvents.includes(OrderEvent.REQUEST_RETURN);
  const primaryEvents = validEvents.filter((event) => event !== OrderEvent.CANCEL_ORDER);
  const canCancel = validEvents.includes(OrderEvent.CANCEL_ORDER);

  return (
    <Panel>
      <SectionHeader eyebrow="Próxima acción" title={QUESTION_BY_STATE[order.state] ?? "Acciones disponibles"} />

      {requiresReturnContext ? (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
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
          <p className="mt-1.5 text-xs text-slate-400">Solo procede si es ≤ 30.</p>
        </div>
      ) : null}

      {primaryEvents.length === 0 && !canCancel ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Este pedido llegó a un estado final.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {primaryEvents.map((event) => (
            <Button key={event} size="lg" onClick={() => attemptEvent(event)}>
              {ORDER_EVENT_LABELS[event]}
            </Button>
          ))}
        </div>
      )}

      {canCancel ? (
        <button
          onClick={() => attemptEvent(OrderEvent.CANCEL_ORDER)}
          className="mt-4 text-sm font-semibold text-rose-500 underline-offset-2 transition-colors hover:text-rose-700 hover:underline"
        >
          Cancelar pedido
        </button>
      ) : null}
    </Panel>
  );
}
