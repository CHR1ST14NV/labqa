import { isDefectTarget } from "../../testing/defectInjection";
import { findRule } from "./transitions";
import {
  OrderEvent,
  OrderState,
  TransitionContext,
  TransitionResult,
  TransitionRunOptions,
} from "./types";

/**
 * transitionOrder — función pura que decide si (currentState, event) puede
 * ejecutarse según TRANSITION_RULES (transitions.ts). No muta nada externo,
 * no usa red ni almacenamiento: recibe el estado actual y devuelve el
 * resultado, listo para que la UI decida qué hacer con él.
 *
 * Una transición inválida NUNCA cambia resultingState: siempre devuelve el
 * currentState recibido.
 */
export function transitionOrder(
  currentState: OrderState,
  event: OrderEvent,
  context: TransitionContext = {},
  options: TransitionRunOptions = {},
): TransitionResult {
  const timestamp = new Date().toISOString();
  const rule = findRule(currentState, event);

  if (!rule) {
    return {
      success: false,
      previousState: currentState,
      event,
      resultingState: currentState,
      expectedState: currentState,
      ruleId: "NONE",
      message: `No existe una transición definida para el evento "${event}" desde el estado "${currentState}".`,
      timestamp,
    };
  }

  // Modo defecto: solo tiene efecto sobre la única regla marcada como
  // defectInjectable (T11), y solo si el llamador lo pidió explícitamente.
  // Cualquier otra regla del arreglo es completamente inmune al flag.
  const applyDefect =
    Boolean(options.defectModeEnabled) && Boolean(rule.defectInjectable) && isDefectTarget(rule.id);

  if (!rule.permitted && !applyDefect) {
    return {
      success: false,
      previousState: currentState,
      event,
      resultingState: currentState,
      expectedState: currentState,
      ruleId: rule.id,
      message: rule.description,
      timestamp,
    };
  }

  if (rule.permitted && rule.guard && !rule.guard(context)) {
    return {
      success: false,
      previousState: currentState,
      event,
      resultingState: currentState,
      expectedState: currentState,
      ruleId: rule.id,
      message: `${rule.description} (condición no cumplida: ${rule.guardDescription ?? "guard"}).`,
      timestamp,
    };
  }

  if (applyDefect) {
    // Comportamiento incorrecto simulado: el pedido SÍ se cancela aunque la
    // regla real (T11) diga permitted:false. El oráculo de TE-009 (en
    // testCases.ts) no se toca por esto — solo el "obtenido" cambia.
    return {
      success: true,
      previousState: currentState,
      event,
      resultingState: OrderState.CANCELLED,
      expectedState: currentState,
      ruleId: rule.id,
      message:
        "[MODO DEFECTO] Se permitió incorrectamente cancelar un pedido ya enviado. Esta es una violación deliberada de la regla T11.",
      timestamp,
      defectApplied: true,
    };
  }

  return {
    success: true,
    previousState: currentState,
    event,
    resultingState: rule.to,
    expectedState: rule.to,
    ruleId: rule.id,
    message: rule.description,
    timestamp,
  };
}

/** Eventos válidos desde un estado dado, derivados de la misma tabla de reglas. */
export function validEventsFrom(state: OrderState): OrderEvent[] {
  const events = new Set<OrderEvent>();
  for (const rule of Object.values(OrderEvent)) {
    const match = findRule(state, rule);
    if (match?.permitted) {
      events.add(rule);
    }
  }
  return Array.from(events);
}
