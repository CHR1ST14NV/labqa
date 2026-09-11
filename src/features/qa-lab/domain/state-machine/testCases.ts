import { OrderEvent, OrderState, TransitionContext } from "./types";

// ============================================================================
// Casos de prueba TE-XXX de Transición de Estados.
//
// El "esperado" de cada caso está escrito a mano aquí, de forma literal —
// NO se calcula llamando a transitionOrder(). Este es el ORÁCULO del test:
// debe poder afirmar "esto es lo correcto" de forma completamente
// independiente del motor que se está probando. Así, si el motor (o el modo
// defecto) se comporta distinto de lo aquí escrito, el runner lo detecta
// como FAIL en vez de compararse contra sí mismo.
// ============================================================================

export interface StateTestStep {
  event: OrderEvent;
  context?: TransitionContext;
}

export interface StateTestCase {
  id: string;
  name: string;
  objective: string;
  precondition: string;
  initialState: OrderState;
  steps: StateTestStep[];
  expectedSuccess: boolean;
  expectedFinalState: OrderState;
  expectedRuleId: string;
}

export const STATE_TEST_CASES: StateTestCase[] = [
  {
    id: "TE-001",
    name: "Confirmar pedido",
    objective: "Verificar que un pedido recién creado avanza a pendiente de pago.",
    precondition: "Pedido en CREATED.",
    initialState: OrderState.CREATED,
    steps: [{ event: OrderEvent.CONFIRM_ORDER }],
    expectedSuccess: true,
    expectedFinalState: OrderState.PAYMENT_PENDING,
    expectedRuleId: "T01",
  },
  {
    id: "TE-002",
    name: "Pago aprobado",
    objective: "Verificar que un pago aprobado marca el pedido como pagado.",
    precondition: "Pedido en PAYMENT_PENDING.",
    initialState: OrderState.PAYMENT_PENDING,
    steps: [{ event: OrderEvent.PAYMENT_APPROVED }],
    expectedSuccess: true,
    expectedFinalState: OrderState.PAID,
    expectedRuleId: "T02",
  },
  {
    id: "TE-003",
    name: "Pago rechazado mantiene pendiente de pago",
    objective: "Verificar que un pago rechazado no hace avanzar el pedido y registra el intento.",
    precondition: "Pedido en PAYMENT_PENDING.",
    initialState: OrderState.PAYMENT_PENDING,
    steps: [{ event: OrderEvent.PAYMENT_REJECTED }],
    expectedSuccess: true,
    expectedFinalState: OrderState.PAYMENT_PENDING,
    expectedRuleId: "T03",
  },
  {
    id: "TE-004",
    name: "Inicio de preparación",
    objective: "Verificar que un pedido pagado puede empezar a prepararse.",
    precondition: "Pedido en PAID.",
    initialState: OrderState.PAID,
    steps: [{ event: OrderEvent.START_PREPARATION }],
    expectedSuccess: true,
    expectedFinalState: OrderState.PREPARING,
    expectedRuleId: "T04",
  },
  {
    id: "TE-005",
    name: "Despacho",
    objective: "Verificar que un pedido en preparación puede despacharse.",
    precondition: "Pedido en PREPARING.",
    initialState: OrderState.PREPARING,
    steps: [{ event: OrderEvent.DISPATCH_ORDER }],
    expectedSuccess: true,
    expectedFinalState: OrderState.SHIPPED,
    expectedRuleId: "T05",
  },
  {
    id: "TE-006",
    name: "Entrega",
    objective: "Verificar que un pedido enviado puede confirmarse como entregado.",
    precondition: "Pedido en SHIPPED.",
    initialState: OrderState.SHIPPED,
    steps: [{ event: OrderEvent.CONFIRM_DELIVERY }],
    expectedSuccess: true,
    expectedFinalState: OrderState.DELIVERED,
    expectedRuleId: "T06",
  },
  {
    id: "TE-007",
    name: "Cancelación desde CREATED",
    objective: "Verificar que un pedido recién creado puede cancelarse.",
    precondition: "Pedido en CREATED.",
    initialState: OrderState.CREATED,
    steps: [{ event: OrderEvent.CANCEL_ORDER }],
    expectedSuccess: true,
    expectedFinalState: OrderState.CANCELLED,
    expectedRuleId: "T07",
  },
  {
    id: "TE-008",
    name: "Cancelación desde PAYMENT_PENDING",
    objective: "Verificar que un pedido con pago pendiente puede cancelarse.",
    precondition: "Pedido en PAYMENT_PENDING.",
    initialState: OrderState.PAYMENT_PENDING,
    steps: [{ event: OrderEvent.CANCEL_ORDER }],
    expectedSuccess: true,
    expectedFinalState: OrderState.CANCELLED,
    expectedRuleId: "T08",
  },
  {
    id: "TE-009",
    name: "Intentar cancelar un pedido enviado (SHIPPED)",
    objective:
      "Verificar que un pedido ya despachado NO puede cancelarse. Caso principal de la demo de inyección de defectos.",
    precondition: "Pedido en SHIPPED.",
    initialState: OrderState.SHIPPED,
    steps: [{ event: OrderEvent.CANCEL_ORDER }],
    expectedSuccess: false,
    expectedFinalState: OrderState.SHIPPED,
    expectedRuleId: "T11",
  },
  {
    id: "TE-010",
    name: "Intentar cancelar un pedido entregado (DELIVERED)",
    objective: "Verificar que un pedido ya entregado NO puede cancelarse.",
    precondition: "Pedido en DELIVERED.",
    initialState: OrderState.DELIVERED,
    steps: [{ event: OrderEvent.CANCEL_ORDER }],
    expectedSuccess: false,
    expectedFinalState: OrderState.DELIVERED,
    expectedRuleId: "T12",
  },
  {
    id: "TE-011",
    name: "Devolución dentro de 30 días",
    objective: "Verificar que la devolución procede dentro de la ventana permitida.",
    precondition: "Pedido en DELIVERED, entregado hace 10 días.",
    initialState: OrderState.DELIVERED,
    steps: [{ event: OrderEvent.REQUEST_RETURN, context: { daysSinceDelivery: 10 } }],
    expectedSuccess: true,
    expectedFinalState: OrderState.RETURN_REQUESTED,
    expectedRuleId: "T14",
  },
  {
    id: "TE-012",
    name: "Devolución después de 30 días",
    objective: "Verificar que la devolución se rechaza fuera de la ventana permitida.",
    precondition: "Pedido en DELIVERED, entregado hace 45 días.",
    initialState: OrderState.DELIVERED,
    steps: [{ event: OrderEvent.REQUEST_RETURN, context: { daysSinceDelivery: 45 } }],
    expectedSuccess: false,
    expectedFinalState: OrderState.DELIVERED,
    expectedRuleId: "T14",
  },
  {
    id: "TE-013",
    name: "Aprobar devolución",
    objective: "Verificar que una devolución solicitada puede aprobarse.",
    precondition: "Pedido en RETURN_REQUESTED.",
    initialState: OrderState.RETURN_REQUESTED,
    steps: [{ event: OrderEvent.APPROVE_RETURN }],
    expectedSuccess: true,
    expectedFinalState: OrderState.RETURNED,
    expectedRuleId: "T15",
  },
  {
    id: "TE-014",
    name: "Intentar transición desde CANCELLED",
    objective: "Verificar que un estado terminal (CANCELLED) no acepta más eventos.",
    precondition: "Pedido en CANCELLED.",
    initialState: OrderState.CANCELLED,
    steps: [{ event: OrderEvent.CONFIRM_ORDER }],
    expectedSuccess: false,
    expectedFinalState: OrderState.CANCELLED,
    expectedRuleId: "T16",
  },
  {
    id: "TE-015",
    name: "Intentar transición desde RETURNED",
    objective: "Verificar que un estado terminal (RETURNED) no acepta más eventos.",
    precondition: "Pedido en RETURNED.",
    initialState: OrderState.RETURNED,
    steps: [{ event: OrderEvent.CONFIRM_ORDER }],
    expectedSuccess: false,
    expectedFinalState: OrderState.RETURNED,
    expectedRuleId: "T17",
  },
  {
    id: "TE-E2E-001",
    name: "Flujo feliz completo",
    objective: "Verificar el recorrido completo del pedido desde su creación hasta la entrega.",
    precondition: "Pedido en CREATED.",
    initialState: OrderState.CREATED,
    steps: [
      { event: OrderEvent.CONFIRM_ORDER },
      { event: OrderEvent.PAYMENT_APPROVED },
      { event: OrderEvent.START_PREPARATION },
      { event: OrderEvent.DISPATCH_ORDER },
      { event: OrderEvent.CONFIRM_DELIVERY },
    ],
    expectedSuccess: true,
    expectedFinalState: OrderState.DELIVERED,
    expectedRuleId: "T06",
  },
];
