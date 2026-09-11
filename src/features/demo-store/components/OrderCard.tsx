"use client";

import { isTerminalState } from "../../qa-lab/domain/state-machine/states";
import { ORDER_STATE_LABELS } from "../../qa-lab/domain/state-machine/types";
import { useDemoStore } from "../state/DemoStoreContext";

function q(amount: number): string {
  return `Q${amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Header compacto de la vista "Order Detail" — reemplaza la tarjeta grande
// de colores por algo más cercano a un header de producto real.
export function OrderCard() {
  const { order } = useDemoStore();
  if (!order) return null;

  const terminal = isTerminalState(order.state);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="font-mono text-sm font-semibold text-slate-400">#{order.code}</p>
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-slate-900">
          {order.productoNombre}
        </h1>
        <p className="text-sm text-slate-500">{order.clienteNombre}</p>
      </div>
      <div className="text-right">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            terminal ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${terminal ? "bg-amber-500" : "bg-blue-600"} animate-pulse`}
          />
          {ORDER_STATE_LABELS[order.state]}
        </span>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {q(order.quote.total)}
        </p>
      </div>
    </div>
  );
}
