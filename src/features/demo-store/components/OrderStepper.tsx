"use client";

import { Check } from "lucide-react";
import { ORDER_STATE_LABELS, OrderState } from "../../qa-lab/domain/state-machine/types";
import { useDemoStore } from "../state/DemoStoreContext";

// Puramente visual: el índice se deriva de order.state dentro de una lista
// fija del flujo feliz. No valida ni decide nada — eso sigue siendo
// transitionOrder() (ver OrderLifecycle).
const HAPPY_PATH: OrderState[] = [
  OrderState.CREATED,
  OrderState.PAYMENT_PENDING,
  OrderState.PAID,
  OrderState.PREPARING,
  OrderState.SHIPPED,
  OrderState.DELIVERED,
];

export function OrderStepper() {
  const { order } = useDemoStore();
  if (!order) return null;

  const currentIndex = HAPPY_PATH.indexOf(order.state);
  const offPath = currentIndex === -1;

  return (
    <div>
      <div className="flex items-center">
        {HAPPY_PATH.map((state, index) => {
          const done = !offPath && index < currentIndex;
          const active = !offPath && index === currentIndex;
          return (
            <div key={state} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    active
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`mt-2 whitespace-nowrap text-[11px] font-bold ${
                    active ? "text-blue-700" : done ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {ORDER_STATE_LABELS[state]}
                </span>
              </div>
              {index < HAPPY_PATH.length - 1 ? (
                <div className="mx-1.5 h-0.5 flex-1 -translate-y-3.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      done ? "w-full bg-emerald-400" : "w-0 bg-blue-400"
                    }`}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {offPath ? (
        <p className="mt-4 text-xs font-semibold text-amber-700">
          Fuera del flujo feliz — {ORDER_STATE_LABELS[order.state]}.
        </p>
      ) : null}
    </div>
  );
}
