// QA LAB — dominio puro de Transición de Estados (caso academico: PEDIDO).
// Nada en este archivo toca red, DOM, ni ningún sistema externo. Módulo
// standalone: no depende de ningún backend ni proyecto productivo.

export enum OrderState {
  CREATED = "CREATED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURNED = "RETURNED",
}

export enum OrderEvent {
  CONFIRM_ORDER = "CONFIRM_ORDER",
  PAYMENT_APPROVED = "PAYMENT_APPROVED",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
  START_PREPARATION = "START_PREPARATION",
  DISPATCH_ORDER = "DISPATCH_ORDER",
  CONFIRM_DELIVERY = "CONFIRM_DELIVERY",
  CANCEL_ORDER = "CANCEL_ORDER",
  REQUEST_RETURN = "REQUEST_RETURN",
  APPROVE_RETURN = "APPROVE_RETURN",
}

// Contexto opcional que algunas guard conditions necesitan (ej. dias
// transcurridos desde la entrega para decidir si la devolucion procede).
export interface TransitionContext {
  daysSinceDelivery?: number;
}

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  [OrderState.CREATED]: "Creado",
  [OrderState.PAYMENT_PENDING]: "Pendiente de pago",
  [OrderState.PAID]: "Pagado",
  [OrderState.PREPARING]: "En preparación",
  [OrderState.SHIPPED]: "Enviado",
  [OrderState.DELIVERED]: "Entregado",
  [OrderState.CANCELLED]: "Cancelado",
  [OrderState.RETURN_REQUESTED]: "Devolución solicitada",
  [OrderState.RETURNED]: "Devuelto",
};

export const ORDER_EVENT_LABELS: Record<OrderEvent, string> = {
  [OrderEvent.CONFIRM_ORDER]: "Confirmar pedido",
  [OrderEvent.PAYMENT_APPROVED]: "Pago aprobado",
  [OrderEvent.PAYMENT_REJECTED]: "Pago rechazado",
  [OrderEvent.START_PREPARATION]: "Iniciar preparación",
  [OrderEvent.DISPATCH_ORDER]: "Despachar pedido",
  [OrderEvent.CONFIRM_DELIVERY]: "Confirmar entrega",
  [OrderEvent.CANCEL_ORDER]: "Cancelar pedido",
  [OrderEvent.REQUEST_RETURN]: "Solicitar devolución",
  [OrderEvent.APPROVE_RETURN]: "Aprobar devolución",
};

// Una fila de la ÚNICA fuente de verdad: matriz visual, diagrama, motor y
// casos de prueba se derivan todos de este arreglo (ver transitions.ts).
export interface TransitionRule {
  id: string;
  from: OrderState;
  event: OrderEvent;
  permitted: boolean;
  to: OrderState; // estado resultante si permitted=true y el guard (si existe) pasa
  guard?: (context: TransitionContext) => boolean;
  guardDescription?: string;
  description: string;
  // Solo T11 (SHIPPED + CANCEL_ORDER) es candidata a inyeccion de defecto
  // educativa (ver testing/defectInjection.ts). Cualquier otra regla ignora
  // el flag de modo defecto.
  defectInjectable?: boolean;
  logsFailedAttempt?: boolean;
}

export interface TransitionRunOptions {
  defectModeEnabled?: boolean;
}

export interface TransitionResult {
  success: boolean;
  previousState: OrderState;
  event: OrderEvent;
  resultingState: OrderState;
  expectedState: OrderState;
  ruleId: string;
  message: string;
  timestamp: string;
  defectApplied?: boolean;
}
