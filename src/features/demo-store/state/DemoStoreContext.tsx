"use client";

// Estado del MÓDULO DE GESTIÓN DE PEDIDOS (la "aplicación bajo prueba").
//
// Importante: este contexto NO reimplementa ninguna regla de negocio. Tanto
// el descuento como el ciclo de vida del pedido se calculan llamando
// directamente a las mismas funciones puras que usa el QA Lab
// (evaluateDecision / transitionOrder). Si esas reglas cambian algún día,
// tanto la app como el QA Lab quedan sincronizados automáticamente porque
// leen del mismo lugar — no hay una segunda copia del motor aquí.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { evaluateDecision } from "../../qa-lab/domain/decision-table/decisionEngine";
import { findDecisionRule } from "../../qa-lab/domain/decision-table/rules";
import { DecisionConditions } from "../../qa-lab/domain/decision-table/types";
import { transitionOrder, validEventsFrom } from "../../qa-lab/domain/state-machine/stateMachine";
import {
  ORDER_EVENT_LABELS,
  ORDER_STATE_LABELS,
  OrderEvent,
  OrderState,
} from "../../qa-lab/domain/state-machine/types";

export interface OrderDraft {
  clienteNombre: string;
  productoNombre: string;
  // null = campo vacío todavía (el usuario no escribió un precio). Se
  // mantiene distinto de 0 a propósito: 0 es un valor inválido rechazado
  // por la validación, vacío es simplemente "todavía no hay dato".
  subtotal: number | null;
  vip: boolean;
  couponValid: boolean;
  allowsPromotions: boolean;
}

export interface OrderQuote {
  conditions: DecisionConditions;
  discountPercent: number;
  discountAmount: number;
  total: number;
  couponRejected: boolean;
  ruleId: string;
}

export interface ConfirmedOrder {
  code: string;
  clienteNombre: string;
  productoNombre: string;
  subtotal: number;
  quote: OrderQuote;
  state: OrderState;
}

// Igual que en el QA Lab, pero con vocabulario de aplicación: esto es el
// comportamiento normal del módulo, no evidencia de un caso de prueba. Por
// eso "accepted" en vez de "pass", y nunca se muestra PASS/FAIL aquí.
export interface OrderTimelineEntry {
  time: string;
  previousStateLabel: string;
  eventLabel: string;
  resultingStateLabel: string;
  accepted: boolean;
  message: string;
}

const DEFAULT_DRAFT: OrderDraft = {
  clienteNombre: "",
  productoNombre: "",
  subtotal: null,
  vip: false,
  couponValid: false,
  allowsPromotions: true,
};

// Contador simple para el código visible del pedido (DEMO-001, DEMO-002…).
// Es solo un correlativo de UI para la demo, no un identificador de negocio.
let demoOrderSequence = 0;

// Cálculo PURO de "qué pasa si disparo este evento desde este estado" —
// deliberadamente separado de cualquier hook de React para que:
//   1. sea trivial de testear sin renderizar nada (ver
//      DemoStoreContext.test.ts), y
//   2. attemptEvent pueda llamarlo UNA sola vez y usar el resultado para dos
//      setState independientes, en vez de recalcularlo (con efectos
//      secundarios) dentro del updater de alguno de los dos.
// No repite ninguna regla de negocio: es una fachada de transitionOrder
// (el motor real) más el mapeo a las etiquetas ya usadas por el timeline.
export function computeOrderTransition(
  currentState: OrderState,
  event: OrderEvent,
  daysSinceDelivery: number,
): { resultingState: OrderState; timelineEntry: Omit<OrderTimelineEntry, "time"> } {
  const result = transitionOrder(currentState, event, { daysSinceDelivery });

  return {
    resultingState: result.resultingState,
    timelineEntry: {
      previousStateLabel: ORDER_STATE_LABELS[result.previousState],
      eventLabel: ORDER_EVENT_LABELS[event],
      resultingStateLabel: ORDER_STATE_LABELS[result.resultingState],
      accepted: result.success,
      message: result.message,
    },
  };
}

function buildQuote(draft: OrderDraft): OrderQuote {
  // El precio solo llega acá con un valor válido (>0): la UI no habilita
  // "Calcular descuento" hasta entonces. `?? 0` es solo una guarda de tipos.
  const subtotal = draft.subtotal ?? 0;

  const conditions: DecisionConditions = {
    vip: draft.vip,
    amountGte500: subtotal >= 500,
    couponValid: draft.couponValid,
    allowsPromotions: draft.allowsPromotions,
  };

  // Única llamada real al motor de descuentos — nada de esto se recalcula
  // a mano en el formulario.
  const actions = evaluateDecision(conditions);
  const rule = findDecisionRule(conditions);
  const discountAmount = Math.round(subtotal * (actions.discountPercent / 100) * 100) / 100;

  return {
    conditions,
    discountPercent: actions.discountPercent,
    discountAmount,
    total: Math.round((subtotal - discountAmount) * 100) / 100,
    couponRejected: actions.rejectCoupon,
    ruleId: rule?.id ?? "N/A",
  };
}

interface DemoStoreContextValue {
  draft: OrderDraft;
  updateDraft: (patch: Partial<OrderDraft>) => void;
  quote: OrderQuote;
  hasCalculated: boolean;
  canCalculate: boolean;
  calculateQuote: () => void;
  order: ConfirmedOrder | null;
  timeline: OrderTimelineEntry[];
  validEvents: OrderEvent[];
  daysSinceDelivery: number;
  setDaysSinceDelivery: (days: number) => void;
  confirmOrder: () => void;
  attemptEvent: (event: OrderEvent) => void;
  resetOrder: () => void;
}

const DemoStoreContext = createContext<DemoStoreContextValue | undefined>(undefined);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OrderDraft>(DEFAULT_DRAFT);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineEntry[]>([]);
  const [daysSinceDelivery, setDaysSinceDelivery] = useState(10);

  const quote = useMemo(() => buildQuote(draft), [draft]);

  const updateDraft = useCallback((patch: Partial<OrderDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  // Único lugar donde vive la regla de "formulario listo para cotizar":
  // cliente y producto no vacíos, precio numérico y mayor a cero. La UI
  // (OrderForm) solo lee este valor para habilitar/deshabilitar el botón.
  const canCalculate =
    draft.clienteNombre.trim().length > 0 &&
    draft.productoNombre.trim().length > 0 &&
    draft.subtotal !== null &&
    draft.subtotal > 0;

  const calculateQuote = useCallback(() => {
    if (!canCalculate) return;
    setHasCalculated(true);
  }, [canCalculate]);

  const confirmOrder = useCallback(() => {
    demoOrderSequence += 1;
    setOrder({
      code: `DEMO-${String(demoOrderSequence).padStart(3, "0")}`,
      clienteNombre: draft.clienteNombre.trim() || "Consumidor final",
      productoNombre: draft.productoNombre.trim() || "Producto sin nombre",
      subtotal: draft.subtotal ?? 0,
      quote,
      state: OrderState.CREATED,
    });
    setTimeline([]);
  }, [draft, quote]);

  // Idéntico principio que el QA Lab: nunca se muta el estado a mano, se
  // delega SIEMPRE en transitionOrder (motor de estados) y se adopta lo que
  // devuelve. La app bajo prueba nunca pasa defectModeEnabled — ese flag es
  // exclusivo del contexto de pruebas del QA Lab.
  //
  // IMPORTANTE (bug corregido): el updater de setOrder debe ser PURO. Antes,
  // computeOrderTransition + setTimeline vivían DENTRO del callback
  // `prev => ...` de setOrder. Con React 18 StrictMode, React invoca dos
  // veces (en desarrollo) cualquier función updater pasada a setState,
  // precisamente para detectar que no sea pura — y como ese updater
  // disparaba setTimeline como efecto secundario, cada clic terminaba
  // agregando DOS entradas idénticas al historial. La transición en sí no
  // se duplicaba (el resultado era el mismo en ambas invocaciones), pero el
  // side effect sí. La solución: calcular la transición UNA vez, fuera de
  // cualquier updater, y llamar a setTimeline con ese resultado ya
  // calculado; setOrder recibe un updater que solo lee `current` y agrega
  // el estado nuevo — cero efectos secundarios, así que no importa cuántas
  // veces React lo invoque internamente.
  const attemptEvent = useCallback(
    (event: OrderEvent) => {
      if (!order) return;

      const { resultingState, timelineEntry } = computeOrderTransition(
        order.state,
        event,
        daysSinceDelivery,
      );

      setTimeline((prev) => [
        { time: new Date().toLocaleTimeString("es-GT"), ...timelineEntry },
        ...prev,
      ]);

      setOrder((current) => (current ? { ...current, state: resultingState } : current));
    },
    [order, daysSinceDelivery],
  );

  const resetOrder = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    setHasCalculated(false);
    setOrder(null);
    setTimeline([]);
    setDaysSinceDelivery(10);
  }, []);

  const validEvents = useMemo(
    () => (order ? validEventsFrom(order.state) : []),
    [order],
  );

  const value = useMemo<DemoStoreContextValue>(
    () => ({
      draft,
      updateDraft,
      quote,
      hasCalculated,
      canCalculate,
      calculateQuote,
      order,
      timeline,
      validEvents,
      daysSinceDelivery,
      setDaysSinceDelivery,
      confirmOrder,
      attemptEvent,
      resetOrder,
    }),
    [
      draft,
      updateDraft,
      quote,
      hasCalculated,
      canCalculate,
      calculateQuote,
      order,
      timeline,
      validEvents,
      daysSinceDelivery,
      confirmOrder,
      attemptEvent,
      resetOrder,
    ],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStoreContextValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore debe usarse dentro de <DemoStoreProvider>");
  }
  return ctx;
}
