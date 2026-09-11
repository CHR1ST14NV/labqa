"use client";

// ============================================================================
// KIT VISUAL — piezas de presentación compartidas por QA Lab y Demo Store.
// Puramente presentacional: ningún archivo aquí importa de domain/ ni de
// testing/, ni decide reglas de negocio. Solo recibe props y pinta.
// ============================================================================
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// StatusPill — reemplaza los badges dispersos (APROBADA/FALLIDA,
// ACEPTADA/RECHAZADA, PERMITIDA/BLOQUEADA, técnica, etc.) con un único
// componente consistente.
// ---------------------------------------------------------------------------
type PillTone = "neutral" | "blue" | "green" | "amber" | "red" | "violet";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
};

export function StatusPill({
  children,
  tone = "neutral",
  icon,
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: PillTone;
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        PILL_TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// Veredicto de un CASO DE PRUEBA (TestRunner / TestCases / Evidencia).
//
// `pass` es tri-estado a propósito: un caso DISEÑADO no queda "aprobado"
// solo por existir en el catálogo. `null` significa "todavía no se ejecutó
// ninguna suite que cubra este caso" — distinto de `false` (se ejecutó y
// falló). Ver TestCases.tsx para el único lugar que necesita este tercer
// estado; TestRunner/EvidenceLog siguen pasando siempre boolean porque ahí
// el caso, por definición, ya se ejecutó.
export function PassFailPill({ pass, size }: { pass: boolean | null; size?: "sm" | "md" }) {
  if (pass === null) {
    return (
      <StatusPill tone="neutral" size={size}>
        SIN EJECUTAR
      </StatusPill>
    );
  }

  return (
    <StatusPill
      tone={pass ? "green" : "red"}
      size={size}
      icon={pass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
    >
      {pass ? "APROBADA" : "FALLIDA"}
    </StatusPill>
  );
}

// Uso exclusivo de operaciones MANUALES (simulador, Demo Store). Nunca
// mezclar con PassFailPill — son dos vocabularios distintos a propósito.
export function AcceptedRejectedPill({ accepted, size }: { accepted: boolean; size?: "sm" | "md" }) {
  return (
    <StatusPill tone={accepted ? "blue" : "amber"} size={size}>
      {accepted ? "Aceptada" : "Rechazada"}
    </StatusPill>
  );
}

export function AllowedBlockedPill({ permitted }: { permitted: boolean }) {
  return (
    <StatusPill tone={permitted ? "green" : "neutral"} size="sm">
      {permitted ? "Permitida" : "Bloqueada"}
    </StatusPill>
  );
}

export function GuardPill() {
  return (
    <StatusPill tone="violet" size="sm">
      Condición
    </StatusPill>
  );
}

export function FinalPill() {
  return (
    <StatusPill tone="amber" size="sm">
      Final
    </StatusPill>
  );
}

// Distingue el caso de prueba por técnica (Transición vs Decisión). TE/TD
// son identificadores técnicos — se mantienen tal cual en la UI.
export function TechniquePill({ technique }: { technique: "ESTADOS" | "DECISION" }) {
  const isEstados = technique === "ESTADOS";
  return (
    <StatusPill tone={isEstados ? "blue" : "violet"} size="sm">
      {isEstados ? "TE" : "TD"}
    </StatusPill>
  );
}

// ---------------------------------------------------------------------------
// PageHeader — encabezado de una "pantalla" completa.
// ---------------------------------------------------------------------------
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-[2.25rem] font-bold leading-tight tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 text-[15px] text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader — cabecera pequeña dentro de un panel.
// ---------------------------------------------------------------------------
export function SectionHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{eyebrow}</p>
        ) : null}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {actions}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel — la única "card" del sistema. Border casi invisible, sombra apenas
// perceptible, radius grande. Se usa solo cuando agrupar contenido aporta.
// ---------------------------------------------------------------------------
export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.08)]",
        padded ? "p-6" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric — número grande + label. Usado en Resumen, Ejecución, resúmenes.
// ---------------------------------------------------------------------------
export function Metric({
  label,
  value,
  tone = "neutral",
  emphasis,
  big,
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "green" | "red" | "blue";
  emphasis?: boolean;
  big?: boolean;
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-600"
      : tone === "red"
        ? "text-rose-600"
        : tone === "blue"
          ? "text-blue-600"
          : "text-slate-900";

  return (
    <div
      className={cn(
        "transition-transform duration-200",
        emphasis ? "scale-[1.03]" : "",
      )}
    >
      <p
        className={cn(
          "font-bold tabular-nums tracking-tight transition-colors duration-200",
          big ? "text-5xl" : "text-4xl",
          toneClass,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SegmentedControl — selector tipo iOS/macOS para alternar vistas o filtros.
// ---------------------------------------------------------------------------
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: ReactNode }>;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
            value === option.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Switch — toggle premium.
// ---------------------------------------------------------------------------
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  tone = "default",
  size = "md",
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  tone?: "default" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white transition-colors hover:border-slate-300",
        size === "sm" ? "px-3.5 py-2.5" : "px-4 py-3.5",
      )}
    >
      <span>
        <span className="block text-[13.5px] font-bold text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-400">{description}</span> : null}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={(event) => {
          event.preventDefault();
          onCheckedChange(!checked);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900",
          checked ? (tone === "danger" ? "bg-rose-500" : "bg-blue-600") : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-1",
          )}
        />
      </span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Chip — toggle compacto tipo pill (VIP / Cupón / Promociones en Demo Store).
// ---------------------------------------------------------------------------
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150",
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// InspectorPanel — panel lateral de detalle (detalle de regla, de caso).
// ---------------------------------------------------------------------------
export function InspectorPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel className="sticky top-0">
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{eyebrow}</p>
      ) : null}
      <h3 className="mt-0.5 text-xl font-bold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

export function InspectorRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline — feed compacto de actividad (Demo Store e historial interactivo).
// ---------------------------------------------------------------------------
export interface TimelineItem {
  key: string;
  time: string;
  ok: boolean;
  title: string;
  detail: string;
}

export function Timeline({ items, emptyLabel }: { items: TimelineItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-0">
      {items.map((item, index) => (
        <li
          key={item.key}
          className={cn(
            "flex gap-3 py-2.5",
            index !== items.length - 1 ? "border-b border-slate-100" : "",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
            )}
          >
            {item.ok ? "✓" : "!"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-[13.5px] font-bold text-slate-800">{item.title}</p>
              <span className="font-mono text-[11px] text-slate-400">{item.time}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// PresentationBadge — indicador flotante de que el modo presentación está ON.
// ---------------------------------------------------------------------------
export function PresentationBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
      Modo presentación
    </span>
  );
}
