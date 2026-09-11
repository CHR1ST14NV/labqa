"use client";

import { Button } from "@/components/ui/button";
import { Panel, SectionHeader } from "../../qa-lab/components/kit";
import { useDemoStore } from "../state/DemoStoreContext";

function q(amount: number): string {
  return `Q${amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Panel derecho del checkout — traduce visualmente quote (calculado por
// evaluateDecision, ver DemoStoreContext) a un resumen tipo checkout
// premium. No recalcula nada: solo lee `quote`.
export function OrderSummaryPanel() {
  const { draft, quote, hasCalculated, confirmOrder, order } = useDemoStore();

  return (
    <Panel className="lg:sticky lg:top-6">
      <SectionHeader eyebrow="Vista previa" title="Resumen del pedido" />

      <p className="text-sm text-slate-400">Producto</p>
      <p className="text-lg font-bold text-slate-900">
        {draft.productoNombre.trim() || "Sin nombre todavía"}
      </p>

      <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm">
        <Row label="Subtotal" value={q(draft.subtotal)} />
        <Row
          label="Descuento"
          value={hasCalculated ? `${quote.discountPercent}% · ${q(quote.discountAmount)}` : "—"}
        />
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p>
        <p
          className={`text-4xl font-bold tracking-tight transition-all duration-300 ${
            hasCalculated ? "scale-100 text-blue-700" : "scale-95 text-slate-300"
          }`}
        >
          {hasCalculated ? q(quote.total) : "—"}
        </p>
      </div>

      {hasCalculated ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-violet-50 px-2 py-1 font-mono text-xs font-bold text-violet-700">
            {quote.ruleId}
          </span>
          <span className="text-xs text-slate-400">Tabla de Decisiones</span>
          {quote.couponRejected ? (
            <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">
              Cupón rechazado
            </span>
          ) : null}
        </div>
      ) : null}

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={confirmOrder}
        disabled={
          !hasCalculated ||
          Boolean(order) ||
          !draft.clienteNombre.trim() ||
          !draft.productoNombre.trim()
        }
      >
        Crear pedido
      </Button>
      {!hasCalculated ? (
        <p className="mt-2 text-center text-xs text-slate-400">Calculá el descuento primero.</p>
      ) : null}
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
