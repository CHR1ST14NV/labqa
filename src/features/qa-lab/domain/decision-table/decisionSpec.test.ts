import { describe, expect, it } from "vitest";
import { computeExpectedActions } from "./decisionSpec";

// Estos tests validan el ORÁCULO en sí mismo contra el enunciado académico
// — deliberadamente sin importar nada de decisionEngine.ts. Ver
// decisionEngine.test.ts para las pruebas equivalentes sobre la
// implementación bajo prueba (evaluateDecision).
describe("computeExpectedActions — oráculo independiente", () => {
  it("VIP + >=Q500 + cupón válido + promociones -> 20%", () => {
    const result = computeExpectedActions({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(20);
    expect(result.rejectCoupon).toBe(false);
  });

  it("VIP + <Q500 + sin cupón + promociones -> 5%", () => {
    const result = computeExpectedActions({
      vip: true,
      amountGte500: false,
      couponValid: false,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(5);
  });

  it("No VIP + >=Q500 + cupón válido + promociones -> 15%", () => {
    const result = computeExpectedActions({
      vip: false,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBe(15);
  });

  it("cualquier combinación con promociones=NO -> 0%", () => {
    const result = computeExpectedActions({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: false,
    });
    expect(result.discountPercent).toBe(0);
  });

  it("cupón=true y promociones=false -> rechazar cupón", () => {
    const result = computeExpectedActions({
      vip: false,
      amountGte500: false,
      couponValid: true,
      allowsPromotions: false,
    });
    expect(result.rejectCoupon).toBe(true);
  });

  it("nunca supera el 20%", () => {
    const result = computeExpectedActions({
      vip: true,
      amountGte500: true,
      couponValid: true,
      allowsPromotions: true,
    });
    expect(result.discountPercent).toBeLessThanOrEqual(20);
  });
});
