import { DecisionActions, DecisionConditions } from "./types";

const DISCOUNT_CEILING = 20;

/**
 * computeExpectedActions — ORÁCULO independiente del motor de descuentos.
 *
 * Esta es una SEGUNDA implementación de la política de negocio del
 * enunciado académico, escrita aparte de decisionEngine.ts y sin importar
 * nada de ese archivo. Su único propósito es decir qué "debería" pasar
 * según la especificación, para que el test runner tenga contra qué
 * comparar el resultado real del motor (evaluateDecision) — sin depender
 * del propio motor para saber qué es "correcto".
 *
 * Si evaluateDecision() tuviera un bug (p. ej. sumara mal los porcentajes,
 * no aplicara el techo de 20%, o invirtiera la condición del cupón), esta
 * función seguiría devolviendo el valor correcto y el runner lo detectaría
 * como FAIL. Por eso está deliberadamente escrita con una forma distinta
 * (reduce sobre una lista de bonificaciones en vez de acumulación
 * imperativa) — no es un copy/paste de decisionEngine.ts.
 *
 * Ver docs/QA-LAB-TEST-CASES.md para la explicación de por qué esta
 * separación es necesaria.
 */
export function computeExpectedActions(conditions: DecisionConditions): DecisionActions {
  const { vip, amountGte500, couponValid, allowsPromotions } = conditions;

  if (!allowsPromotions) {
    return {
      discountPercent: 0,
      rejectCoupon: couponValid,
    };
  }

  const bonuses = [vip ? 5 : 0, amountGte500 ? 5 : 0, couponValid ? 10 : 0];
  const rawTotal = bonuses.reduce((sum, bonus) => sum + bonus, 0);
  const discountPercent = Math.min(
    rawTotal,
    DISCOUNT_CEILING,
  ) as DecisionActions["discountPercent"];

  return {
    discountPercent,
    rejectCoupon: false,
  };
}
