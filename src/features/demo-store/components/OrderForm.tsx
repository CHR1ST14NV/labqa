"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Check } from "lucide-react";
import { Chip, Panel, SectionHeader } from "../../qa-lab/components/kit";
import { useDemoStore } from "../state/DemoStoreContext";

export function OrderForm() {
  const { draft, updateDraft, canCalculate, calculateQuote } = useDemoStore();

  const clienteFaltante = draft.clienteNombre.trim().length === 0;
  const productoFaltante = draft.productoNombre.trim().length === 0;
  const precioFaltante = draft.subtotal === null || draft.subtotal <= 0;

  const missing = [
    clienteFaltante ? "cliente" : null,
    productoFaltante ? "producto" : null,
    precioFaltante ? "precio" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <Panel>
      <SectionHeader eyebrow="Configurar" title="Configurar pedido" />

      <div className="space-y-4">
        <Field label="Cliente">
          <Input
            value={draft.clienteNombre}
            onChange={(event) => updateDraft({ clienteNombre: event.target.value })}
            placeholder="Juan López"
          />
        </Field>
        <Field label="Producto">
          <Input
            value={draft.productoNombre}
            onChange={(event) => updateDraft({ productoNombre: event.target.value })}
            placeholder="iPhone 18 Pro Max"
          />
        </Field>
        <Field label="Precio (Q)">
          <Input
            type="number"
            min={0.01}
            step="0.01"
            placeholder="Ej. 10500"
            value={draft.subtotal === null ? "" : draft.subtotal}
            onChange={(event) => {
              const raw = event.target.value;
              // Vacío se queda vacío (null) mientras el usuario escribe —
              // nunca se lo transforma en 0 automáticamente.
              if (raw === "") {
                updateDraft({ subtotal: null });
                return;
              }
              const parsed = Number(raw);
              updateDraft({ subtotal: Number.isNaN(parsed) ? null : parsed });
            }}
          />
        </Field>

        {(draft.subtotal ?? 0) >= 500 ? (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Elegible por monto (≥ Q500)
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          Condiciones de promoción
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip active={draft.vip} onClick={() => updateDraft({ vip: !draft.vip })}>
            VIP
          </Chip>
          <Chip active={draft.couponValid} onClick={() => updateDraft({ couponValid: !draft.couponValid })}>
            Cupón
          </Chip>
          <Chip
            active={draft.allowsPromotions}
            onClick={() => updateDraft({ allowsPromotions: !draft.allowsPromotions })}
          >
            Promociones
          </Chip>
        </div>
      </div>

      <Button size="lg" className="mt-6 w-full gap-2" onClick={calculateQuote} disabled={!canCalculate}>
        <Calculator className="h-4 w-4" /> Calcular descuento
      </Button>
      {!canCalculate ? (
        <p className="mt-2 text-center text-xs text-slate-400">
          Completá {formatMissingList(missing)} para calcular el descuento.
        </p>
      ) : null}
    </Panel>
  );
}

function formatMissingList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
