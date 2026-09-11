import { describe, expect, it } from "vitest";
import { evaluateDecision } from "./decisionEngine";
import { DECISION_RULES } from "./rules";

describe("evaluateDecision — ejemplos del enunciado académico", () => {
  it("VIP + >=Q500 + cupón válido + promociones -> 20%", () => {
    const result = evaluateDecision({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(20);
    expect(result.rejectCoupon).toBe(false);
  });

  it("VIP + <Q500 + sin cupón + promociones -> 5%", () => {
    const result = evaluateDecision({
      vip: true,
      amountGte500: false,
      couponValid: false,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(5);
  });

  it("No VIP + >=Q500 + cupón válido + promociones -> 15%", () => {
    const result = evaluateDecision({
      vip: false,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(15);
  });

  it("cualquier combinación con promociones=NO -> 0%", () => {
    const result = evaluateDecision({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: false,
    });
    expect(result.discountPercent).toBe(0);
  });

  it("cupón=true y promociones=false -> rechazar cupón", () => {
    const result = evaluateDecision({
      vip: false,
      amountGte500: false,
      couponValid: true,
      allowsPromotions: false,
    });
    expect(result.rejectCoupon).toBe(true);
    expect(result.discountPercent).toBe(0);
  });

  it("sin cupón y promociones=false, no hay nada que rechazar", () => {
    const result = evaluateDecision({
      vip: true,
      amountGte500: true,
      couponValid: false,
      allowsPromotions: false,
    });
    expect(result.rejectCoupon).toBe(false);
  });
});

describe("evaluateDecision — techo de acumulación", () => {
  it("nunca supera el 20% aunque las tres bonificaciones apliquen", () => {
    const result = evaluateDecision({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBeLessThanOrEqual(20);
  });
});

describe("DECISION_RULES — las 16 combinaciones", () => {
  it("genera exactamente 16 reglas, una por cada combinación binaria de C1..C4", () => {
    expect(DECISION_RULES).toHaveLength(16);
    const unique = new Set(
      DECISION_RULES.map(
        (rule) =>
          `${rule.conditions.vip}-${rule.conditions.amountGte500}-${rule.conditions.couponValid}-${rule.conditions.allowsPromotions}`,
      ),
    );
    expect(unique.size).toBe(16);
  });

  it("ninguna regla supera 20% de descuento", () => {
    DECISION_RULES.forEach((rule) => {
      expect(rule.actions.discountPercent).toBeLessThanOrEqual(20);
    });
  });

  it("toda regla con allowsPromotions=false tiene descuento 0", () => {
    DECISION_RULES.filter((rule) => !rule.conditions.allowsPromotions).forEach((rule) => {
      expect(rule.actions.discountPercent).toBe(0);
    });
  });

  it("rechaza el cupón solo cuando couponValid=true y allowsPromotions=false", () => {
    DECISION_RULES.forEach((rule) => {
      const shouldReject = rule.conditions.couponValid && !rule.conditions.allowsPromotions;
      expect(rule.actions.rejectCoupon).toBe(shouldReject);
    });
  });
});
