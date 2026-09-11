import { describe, expect, it } from "vitest";
import { transitionOrder } from "./stateMachine";
import { OrderEvent, OrderState } from "./types";

describe("transitionOrder — flujo principal (T01-T06)", () => {
  it("T01: CREATED + CONFIRM_ORDER -> PAYMENT_PENDING", () => {
    const result = transitionOrder(OrderState.CREATED, OrderEvent.CONFIRM_ORDER);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.PAYMENT_PENDING);
    expect(result.ruleId).toBe("T01");
  });

  it("T02: PAYMENT_PENDING + PAYMENT_APPROVED -> PAID", () => {
    const result = transitionOrder(OrderState.PAYMENT_PENDING, OrderEvent.PAYMENT_APPROVED);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.PAID);
    expect(result.ruleId).toBe("T02");
  });

  it("T03: PAYMENT_PENDING + PAYMENT_REJECTED se mantiene en PAYMENT_PENDING", () => {
    const result = transitionOrder(OrderState.PAYMENT_PENDING, OrderEvent.PAYMENT_REJECTED);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.PAYMENT_PENDING);
    expect(result.ruleId).toBe("T03");
  });

  it("T04: PAID + START_PREPARATION -> PREPARING", () => {
    const result = transitionOrder(OrderState.PAID, OrderEvent.START_PREPARATION);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.PREPARING);
    expect(result.ruleId).toBe("T04");
  });

  it("T05: PREPARING + DISPATCH_ORDER -> SHIPPED", () => {
    const result = transitionOrder(OrderState.PREPARING, OrderEvent.DISPATCH_ORDER);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.SHIPPED);
    expect(result.ruleId).toBe("T05");
  });

  it("T06: SHIPPED + CONFIRM_DELIVERY -> DELIVERED", () => {
    const result = transitionOrder(OrderState.SHIPPED, OrderEvent.CONFIRM_DELIVERY);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.DELIVERED);
    expect(result.ruleId).toBe("T06");
  });
});

describe("transitionOrder — cancelaciones válidas", () => {
  it.each([
    [OrderState.CREATED, "T07"],
    [OrderState.PAYMENT_PENDING, "T08"],
    [OrderState.PAID, "T09"],
    [OrderState.PREPARING, "T10"],
  ])("permite CANCEL_ORDER desde %s (%s)", (state, ruleId) => {
    const result = transitionOrder(state, OrderEvent.CANCEL_ORDER);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.CANCELLED);
    expect(result.ruleId).toBe(ruleId);
  });
});

describe("transitionOrder — cancelaciones inválidas", () => {
  it.each([
    [OrderState.SHIPPED, "T11"],
    [OrderState.DELIVERED, "T12"],
    [OrderState.RETURN_REQUESTED, "T13"],
  ])("rechaza CANCEL_ORDER desde %s y preserva el estado (%s)", (state, ruleId) => {
    const result = transitionOrder(state, OrderEvent.CANCEL_ORDER);
    expect(result.success).toBe(false);
    expect(result.resultingState).toBe(state);
    expect(result.ruleId).toBe(ruleId);
  });

  it("rechaza CANCEL_ORDER desde CANCELLED (sin regla definida)", () => {
    const result = transitionOrder(OrderState.CANCELLED, OrderEvent.CANCEL_ORDER);
    expect(result.success).toBe(false);
    expect(result.resultingState).toBe(OrderState.CANCELLED);
  });
});

describe("transitionOrder — devolución (guard de 30 días)", () => {
  it("permite REQUEST_RETURN con daysSinceDelivery <= 30", () => {
    const result = transitionOrder(OrderState.DELIVERED, OrderEvent.REQUEST_RETURN, {
      daysSinceDelivery: 30,
    });
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.RETURN_REQUESTED);
  });

  it("rechaza REQUEST_RETURN con daysSinceDelivery > 30 y mantiene DELIVERED", () => {
    const result = transitionOrder(OrderState.DELIVERED, OrderEvent.REQUEST_RETURN, {
      daysSinceDelivery: 31,
    });
    expect(result.success).toBe(false);
    expect(result.resultingState).toBe(OrderState.DELIVERED);
  });

  it("aprueba una devolución solicitada", () => {
    const result = transitionOrder(OrderState.RETURN_REQUESTED, OrderEvent.APPROVE_RETURN);
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.RETURNED);
  });
});

describe("transitionOrder — estados terminales", () => {
  it.each([OrderState.CANCELLED, OrderState.RETURNED])(
    "%s no acepta ningún evento del ciclo de vida",
    (state) => {
      const result = transitionOrder(state, OrderEvent.CONFIRM_ORDER);
      expect(result.success).toBe(false);
      expect(result.resultingState).toBe(state);
    },
  );
});

describe("transitionOrder — modo defecto educativo (TE-009)", () => {
  it("con el defecto OFF, SHIPPED + CANCEL_ORDER se rechaza (comportamiento correcto)", () => {
    const result = transitionOrder(OrderState.SHIPPED, OrderEvent.CANCEL_ORDER, undefined, {
      defectModeEnabled: false,
    });
    expect(result.success).toBe(false);
    expect(result.resultingState).toBe(OrderState.SHIPPED);
  });

  it("con el defecto ON, SHIPPED + CANCEL_ORDER se acepta incorrectamente", () => {
    const result = transitionOrder(OrderState.SHIPPED, OrderEvent.CANCEL_ORDER, undefined, {
      defectModeEnabled: true,
    });
    expect(result.success).toBe(true);
    expect(result.resultingState).toBe(OrderState.CANCELLED);
    expect(result.defectApplied).toBe(true);
  });

  it("el modo defecto NO afecta reglas distintas de T11 (ej. DELIVERED + CANCEL_ORDER sigue rechazada)", () => {
    const result = transitionOrder(OrderState.DELIVERED, OrderEvent.CANCEL_ORDER, undefined, {
      defectModeEnabled: true,
    });
    expect(result.success).toBe(false);
    expect(result.resultingState).toBe(OrderState.DELIVERED);
  });
});
