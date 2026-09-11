import { DecisionActions, DecisionConditions } from "./types";

const MAX_DISCOUNT = 20;

/**
 * evaluateDecision — función pura, motor de descuentos BAJO PRUEBA.
 *
 * Política (coherente con el enunciado académico):
 *  - Si el producto NO permite promociones: descuento = 0 siempre, y si
 *    además se intentó usar un cupón, el cupón se rechaza explícitamente.
 *  - Si permite promociones: se suman +5% (VIP) +5% (compra >= Q500) +10%
 *    (cupón válido), acumulable hasta un techo de 20%.
 */
export function evaluateDecision(conditions: DecisionConditions): DecisionActions {
  if (!conditions.allowsPromotions) {
    return {
      discountPercent: 0,
      rejectCoupon: conditions.couponValid,
    };
  }

  let discount = 0;
  if (conditions.vip) discount += 5;
  if (conditions.amountGte500) discount += 5;
  if (conditions.couponValid) discount += 10;

  const capped = Math.min(discount, MAX_DISCOUNT) as DecisionActions["discountPercent"];

  return {
    discountPercent: capped,
    rejectCoupon: false,
  };
}
