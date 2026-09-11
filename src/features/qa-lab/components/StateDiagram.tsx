"use client";

import { isTerminalState } from "../domain/state-machine/states";
import { ORDER_STATE_LABELS, OrderState } from "../domain/state-machine/types";
import { useQaLab } from "../state/QaLabContext";

// State machine inspector — SVG plano, sin librerías externas ni Mermaid.
// Puramente visual: solo lee currentState/history del contexto para
// resaltar, nunca decide nada.
const NODE_W = 200;
const NODE_H = 50;

const MAIN_CHAIN: Array<{ state: OrderState; y: number; event?: string }> = [
  { state: OrderState.CREATED, y: 24 },
  { state: OrderState.PAYMENT_PENDING, y: 118, event: "Confirmar pedido" },
  { state: OrderState.PAID, y: 212, event: "Pago aprobado" },
  { state: OrderState.PREPARING, y: 306, event: "Iniciar preparación" },
  { state: OrderState.SHIPPED, y: 400, event: "Despachar pedido" },
  { state: OrderState.DELIVERED, y: 494, event: "Confirmar entrega" },
  { state: OrderState.RETURN_REQUESTED, y: 588, event: "Solicitar devolución · ≤30 días" },
  { state: OrderState.RETURNED, y: 682, event: "Aprobar devolución" },
];

const MAIN_X = 240;
const CANCEL_X = 570;
const CANCEL_Y = 212;
const CANCEL_SOURCES = [
  OrderState.CREATED,
  OrderState.PAYMENT_PENDING,
  OrderState.PAID,
  OrderState.PREPARING,
];

export function StateDiagram() {
  const { currentState, history, presentationMode } = useQaLab();
  const lastEntry = history[0];
  const width = 830;
  const height = 750;
  const scale = presentationMode ? 1.15 : 1;

  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Máquina de estados">
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L8,2.5 z" fill="#cbd5e1" />
          </marker>
          <marker id="arrow-active" markerWidth="9" markerHeight="9" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L8,2.5 z" fill="#2563eb" />
          </marker>
          <marker id="arrow-cancel" markerWidth="9" markerHeight="9" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L8,2.5 z" fill="#f59e0b" />
          </marker>
        </defs>

        {MAIN_CHAIN.map((node, index) => {
          if (index === 0) return null;
          const prev = MAIN_CHAIN[index - 1];
          const recentlyUsed =
            lastEntry?.pass &&
            lastEntry.previousStateLabel === ORDER_STATE_LABELS[prev.state] &&
            lastEntry.resultingStateLabel === ORDER_STATE_LABELS[node.state];

          return (
            <g key={`edge-${node.state}`}>
              <line
                x1={MAIN_X + NODE_W / 2}
                y1={prev.y + NODE_H}
                x2={MAIN_X + NODE_W / 2}
                y2={node.y}
                stroke={recentlyUsed ? "#2563eb" : "#cbd5e1"}
                strokeWidth={recentlyUsed ? 3 : 1.5}
                markerEnd={recentlyUsed ? "url(#arrow-active)" : "url(#arrow)"}
                className="transition-all duration-300"
              />
              <text
                x={MAIN_X + NODE_W / 2 + 14}
                y={(prev.y + NODE_H + node.y) / 2 + 4}
                fontSize={11 * scale}
                fill="#94a3b8"
                fontWeight={recentlyUsed ? 700 : 500}
                fontFamily="ui-monospace, monospace"
              >
                {node.event}
              </text>
            </g>
          );
        })}

        {CANCEL_SOURCES.map((state) => {
          const source = MAIN_CHAIN.find((n) => n.state === state);
          if (!source) return null;
          return (
            <line
              key={`cancel-${state}`}
              x1={MAIN_X + NODE_W}
              y1={source.y + NODE_H / 2}
              x2={CANCEL_X}
              y2={CANCEL_Y + NODE_H / 2}
              stroke="#fbbf24"
              strokeWidth={1.2}
              strokeDasharray="4 4"
              markerEnd="url(#arrow-cancel)"
            />
          );
        })}
        <text x={CANCEL_X - 8} y={CANCEL_Y - 12} fontSize={11 * scale} fontWeight={700} fill="#b45309" textAnchor="middle">
          Cancelar pedido
        </text>

        {MAIN_CHAIN.map((node) => {
          const isCurrent = node.state === currentState;
          const terminal = isTerminalState(node.state);
          return (
            <g key={node.state}>
              {isCurrent ? (
                <rect
                  x={MAIN_X - 6}
                  y={node.y - 6}
                  width={NODE_W + 12}
                  height={NODE_H + 12}
                  rx={16}
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth={5}
                  opacity={0.7}
                />
              ) : null}
              <rect
                x={MAIN_X}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx={12}
                fill={isCurrent ? "#2563eb" : terminal ? "#fffbeb" : "#f8fafc"}
                stroke={isCurrent ? "#1d4ed8" : terminal ? "#fbbf24" : "#e2e8f0"}
                strokeWidth={isCurrent ? 0 : 1.2}
                className="transition-all duration-300"
              />
              <circle
                cx={MAIN_X + 22}
                cy={node.y + NODE_H / 2}
                r={4}
                fill={isCurrent ? "#ffffff" : terminal ? "#d97706" : "#94a3b8"}
              />
              <text
                x={MAIN_X + 38}
                y={node.y + NODE_H / 2 + 5}
                fontSize={15 * scale}
                fontWeight={700}
                fill={isCurrent ? "#ffffff" : terminal ? "#92400e" : "#0f172a"}
              >
                {ORDER_STATE_LABELS[node.state]}
              </text>
              {isCurrent ? (
                <text
                  x={MAIN_X + NODE_W - 14}
                  y={node.y + NODE_H / 2 + 4}
                  fontSize={9.5 * scale}
                  fontWeight={800}
                  fill="#dbeafe"
                  textAnchor="end"
                  letterSpacing={0.6}
                >
                  ACTUAL
                </text>
              ) : null}
            </g>
          );
        })}

        <g>
          {currentState === OrderState.CANCELLED ? (
            <rect
              x={CANCEL_X - 6}
              y={CANCEL_Y - 6}
              width={NODE_W + 12}
              height={NODE_H + 12}
              rx={16}
              fill="none"
              stroke="#bfdbfe"
              strokeWidth={5}
              opacity={0.7}
            />
          ) : null}
          <rect
            x={CANCEL_X}
            y={CANCEL_Y}
            width={NODE_W}
            height={NODE_H}
            rx={12}
            fill={currentState === OrderState.CANCELLED ? "#2563eb" : "#fff7ed"}
            stroke={currentState === OrderState.CANCELLED ? "none" : "#fdba74"}
            strokeWidth={1.2}
            className="transition-all duration-300"
          />
          <circle
            cx={CANCEL_X + 22}
            cy={CANCEL_Y + NODE_H / 2}
            r={4}
            fill={currentState === OrderState.CANCELLED ? "#ffffff" : "#ea580c"}
          />
          <text
            x={CANCEL_X + 38}
            y={CANCEL_Y + NODE_H / 2 + 5}
            fontSize={15 * scale}
            fontWeight={700}
            fill={currentState === OrderState.CANCELLED ? "#ffffff" : "#9a3412"}
          >
            {ORDER_STATE_LABELS[OrderState.CANCELLED]}
          </text>
        </g>
      </svg>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-500">
        <Legend dot="bg-blue-600" label="Actual" />
        <Legend dot="bg-slate-300" label="Normal" />
        <Legend dot="bg-amber-500" label="Terminal" />
        <Legend dot="bg-orange-400" label="Ruta de cancelación" />
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
