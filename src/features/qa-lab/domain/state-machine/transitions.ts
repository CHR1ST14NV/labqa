import { OrderEvent, OrderState, TransitionRule } from "./types";

const RETURN_WINDOW_DAYS = 30;

// ============================================================================
// ÚNICA FUENTE DE VERDAD de la máquina de estados del PEDIDO académico.
//
// El motor (stateMachine.ts), la matriz visual (TransitionMatrix.tsx), el
// diagrama (StateDiagram.tsx) y los casos TE-XXX (testCases.ts) leen TODOS
// este mismo arreglo. No se duplica la regla en ningún otro archivo.
//
// Cada fila documenta una combinación (estado, evento) que el equipo
// considera relevante para el ejercicio de Caja Negra: ya sea porque está
// permitida, o porque su rechazo es una regla de negocio explícita que vale
// la pena poder mostrar y probar (no cualquier combinación imposible se
// documenta; las que faltan se rechazan por el motor con un mensaje
// genérico — ver stateMachine.ts).
// ============================================================================
export const TRANSITION_RULES: TransitionRule[] = [
  {
    id: "T01",
    from: OrderState.CREATED,
    event: OrderEvent.CONFIRM_ORDER,
    permitted: true,
    to: OrderState.PAYMENT_PENDING,
    description: "Confirmar el pedido genera el cobro y pasa a pendiente de pago.",
  },
  {
    id: "T02",
    from: OrderState.PAYMENT_PENDING,
    event: OrderEvent.PAYMENT_APPROVED,
    permitted: true,
    to: OrderState.PAID,
    description: "El pago fue aprobado por la pasarela: el pedido queda pagado.",
  },
  {
    id: "T03",
    from: OrderState.PAYMENT_PENDING,
    event: OrderEvent.PAYMENT_REJECTED,
    permitted: true,
    to: OrderState.PAYMENT_PENDING,
    logsFailedAttempt: true,
    description:
      "Un pago rechazado no hace avanzar el pedido: se registra el intento fallido y se mantiene pendiente de pago para reintentar.",
  },
  {
    id: "T04",
    from: OrderState.PAID,
    event: OrderEvent.START_PREPARATION,
    permitted: true,
    to: OrderState.PREPARING,
    description: "Con el pago confirmado, bodega puede iniciar la preparación.",
  },
  {
    id: "T05",
    from: OrderState.PREPARING,
    event: OrderEvent.DISPATCH_ORDER,
    permitted: true,
    to: OrderState.SHIPPED,
    description: "El pedido preparado se despacha al transportista.",
  },
  {
    id: "T06",
    from: OrderState.SHIPPED,
    event: OrderEvent.CONFIRM_DELIVERY,
    permitted: true,
    to: OrderState.DELIVERED,
    description: "El transportista confirma la entrega al cliente.",
  },

  // Cancelación: permitida solo antes de que el pedido salga de la tienda.
  {
    id: "T07",
    from: OrderState.CREATED,
    event: OrderEvent.CANCEL_ORDER,
    permitted: true,
    to: OrderState.CANCELLED,
    description: "Un pedido recién creado puede cancelarse sin restricciones.",
  },
  {
    id: "T08",
    from: OrderState.PAYMENT_PENDING,
    event: OrderEvent.CANCEL_ORDER,
    permitted: true,
    to: OrderState.CANCELLED,
    description: "Mientras el pago esté pendiente, el pedido puede cancelarse.",
  },
  {
    id: "T09",
    from: OrderState.PAID,
    event: OrderEvent.CANCEL_ORDER,
    permitted: true,
    to: OrderState.CANCELLED,
    description: "Pagado pero no preparado todavía: la cancelación procede.",
  },
  {
    id: "T10",
    from: OrderState.PREPARING,
    event: OrderEvent.CANCEL_ORDER,
    permitted: true,
    to: OrderState.CANCELLED,
    description: "En preparación aún es posible detener el pedido y cancelarlo.",
  },

  // Cancelación rechazada de forma explícita — estas filas son las que
  // TE-009/TE-010 ejercitan, y también la única que el modo defecto
  // educativo puede llegar a alterar en tiempo de ejecución (T11, ver
  // testing/defectInjection.ts). El resto (T12/T13) documentan el mismo
  // principio para devolución/estados terminales y quedan fuera del switch
  // de defecto.
  {
    id: "T11",
    from: OrderState.SHIPPED,
    event: OrderEvent.CANCEL_ORDER,
    permitted: false,
    to: OrderState.SHIPPED,
    description: "Un pedido enviado ya no puede cancelarse: ya salió hacia el transportista.",
    defectInjectable: true,
  },
  {
    id: "T12",
    from: OrderState.DELIVERED,
    event: OrderEvent.CANCEL_ORDER,
    permitted: false,
    to: OrderState.DELIVERED,
    description: "Un pedido ya entregado no puede cancelarse; el camino correcto es la devolución.",
  },
  {
    id: "T13",
    from: OrderState.RETURN_REQUESTED,
    event: OrderEvent.CANCEL_ORDER,
    permitted: false,
    to: OrderState.RETURN_REQUESTED,
    description: "Con una devolución en curso, cancelar el pedido original ya no aplica.",
  },

  // Devolución con guard condition de ventana de 30 días.
  {
    id: "T14",
    from: OrderState.DELIVERED,
    event: OrderEvent.REQUEST_RETURN,
    permitted: true,
    to: OrderState.RETURN_REQUESTED,
    guard: (context) => (context.daysSinceDelivery ?? Infinity) <= RETURN_WINDOW_DAYS,
    guardDescription: `daysSinceDelivery <= ${RETURN_WINDOW_DAYS}`,
    description: `La devolución solo procede dentro de los ${RETURN_WINDOW_DAYS} días posteriores a la entrega.`,
  },
  {
    id: "T15",
    from: OrderState.RETURN_REQUESTED,
    event: OrderEvent.APPROVE_RETURN,
    permitted: true,
    to: OrderState.RETURNED,
    description: "La devolución solicitada es aprobada y el pedido queda devuelto.",
  },

  // Estados terminales: cualquier evento documentado aquí se rechaza porque
  // ya no hay ciclo de vida posible. Se listan explícitamente (en vez de
  // dejar que el motor los rechace "por default") para que la matriz y
  // TE-014/TE-015 tengan una fila y una regla concreta que referenciar.
  {
    id: "T16",
    from: OrderState.CANCELLED,
    event: OrderEvent.CONFIRM_ORDER,
    permitted: false,
    to: OrderState.CANCELLED,
    description: "CANCELLED es un estado terminal: ya no acepta ningún evento del ciclo de vida.",
  },
  {
    id: "T17",
    from: OrderState.RETURNED,
    event: OrderEvent.CONFIRM_ORDER,
    permitted: false,
    to: OrderState.RETURNED,
    description: "RETURNED es un estado terminal: ya no acepta ningún evento del ciclo de vida.",
  },
];

export function findRule(
  from: OrderState,
  event: OrderEvent,
): TransitionRule | undefined {
  return TRANSITION_RULES.find((rule) => rule.from === from && rule.event === event);
}
