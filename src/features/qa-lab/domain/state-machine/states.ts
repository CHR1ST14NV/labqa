import { OrderState, ORDER_STATE_LABELS } from "./types";

// Orden visual del flujo principal, usado por el diagrama y por la
// disposicion de la matriz. No es la unica fuente de reglas (eso vive en
// transitions.ts) — esto es solo layout.
export const MAIN_FLOW_STATES: OrderState[] = [
  OrderState.CREATED,
  OrderState.PAYMENT_PENDING,
  OrderState.PAID,
  OrderState.PREPARING,
  OrderState.SHIPPED,
  OrderState.DELIVERED,
  OrderState.RETURN_REQUESTED,
  OrderState.RETURNED,
];

export const TERMINAL_STATES: OrderState[] = [
  OrderState.CANCELLED,
  OrderState.RETURNED,
];

export const ALL_STATES: OrderState[] = Object.values(OrderState);

export function isTerminalState(state: OrderState): boolean {
  return TERMINAL_STATES.includes(state);
}

export function stateLabel(state: OrderState): string {
  return ORDER_STATE_LABELS[state];
}
