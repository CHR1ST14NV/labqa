"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, ShoppingBag } from "lucide-react";
import { OrderForm } from "./OrderForm";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { OrderCard } from "./OrderCard";
import { OrderStepper } from "./OrderStepper";
import { OrderLifecycle } from "./OrderLifecycle";
import { OrderTimeline } from "./OrderTimeline";
import { useDemoStore } from "../state/DemoStoreContext";
import { STATE_TEST_CASES } from "../../qa-lab/domain/state-machine/testCases";
import { TRANSITION_RULES } from "../../qa-lab/domain/state-machine/transitions";
import { DECISION_TEST_CASES } from "../../qa-lab/domain/decision-table/testCases";
import { DECISION_RULES } from "../../qa-lab/domain/decision-table/rules";

const TOTAL_CASES = STATE_TEST_CASES.length + DECISION_TEST_CASES.length;
const TOTAL_RULES = TRANSITION_RULES.length + DECISION_RULES.length;

// SOFTWARE BAJO PRUEBA — Módulo de Gestión de Pedidos ("Demo Store").
//
// Dos vistas dentro de este mismo componente: checkout (antes de crear el
// pedido) y order detail (después). El modo defecto del QA Lab no existe
// acá ni afecta nada: DemoStoreContext nunca pasa defectModeEnabled al
// motor de estados.
export function DemoStoreApp({ onGoToQaLab }: { onGoToQaLab: () => void }) {
  const { order, resetOrder } = useDemoStore();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShoppingBag className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-[15px] font-bold text-slate-900">Demo Store</p>
              <p className="text-xs text-slate-400">Simulación de gestión de pedidos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Software bajo prueba
            </span>
            <Button variant="ghost" size="sm" onClick={resetOrder} className="gap-1.5 text-slate-400">
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        {!order ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <OrderForm />
            <OrderSummaryPanel />
          </div>
        ) : (
          <div className="space-y-8">
            <OrderCard />
            <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <OrderStepper />
            </div>
            <OrderLifecycle />
            <OrderTimeline />
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-blue-100 bg-blue-50/50 px-7 py-6">
          <div>
            <p className="text-sm font-bold text-slate-900">Inspeccionar pruebas</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {TOTAL_CASES} casos · {TOTAL_RULES} reglas · 2 técnicas
            </p>
          </div>
          <Button onClick={onGoToQaLab} className="gap-2">
            Inspeccionar pruebas <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
