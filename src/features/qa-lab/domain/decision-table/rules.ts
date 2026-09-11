import { computeExpectedActions } from "./decisionSpec";
import { DecisionConditions, DecisionRule } from "./types";

const BOOL_VALUES = [true, false] as const;

// Las 16 combinaciones binarias de C1..C4, generadas de forma determinística
// (no a mano). IMPORTANTE: `actions` se calcula con computeExpectedActions
// (decisionSpec.ts) — el ORÁCULO/especificación — y NO con evaluateDecision
// (decisionEngine.ts), que es la implementación bajo prueba. Esta tabla
// representa "lo que debería pasar" según el enunciado académico; el motor
// real se ejecuta aparte, en testRunner.ts, y se compara contra esto. Así,
// un bug introducido en decisionEngine.ts nunca puede arrastrar consigo el
// valor esperado de esta tabla.
export const DECISION_RULES: DecisionRule[] = (() => {
  const rules: DecisionRule[] = [];
  let index = 1;

  for (const vip of BOOL_VALUES) {
    for (const amountGte500 of BOOL_VALUES) {
      for (const couponValid of BOOL_VALUES) {
        for (const allowsPromotions of BOOL_VALUES) {
          const conditions: DecisionConditions = {
            vip,
            amountGte500,
            couponValid,
            allowsPromotions,
          };

          rules.push({
            id: `R${String(index).padStart(2, "0")}`,
            conditions,
            actions: computeExpectedActions(conditions),
          });
          index += 1;
        }
      }
    }
  }

  return rules;
})();

export function findDecisionRule(conditions: DecisionConditions): DecisionRule | undefined {
  return DECISION_RULES.find(
    (rule) =>
      rule.conditions.vip === conditions.vip &&
      rule.conditions.amountGte500 === conditions.amountGte500 &&
      rule.conditions.couponValid === conditions.couponValid &&
      rule.conditions.allowsPromotions === conditions.allowsPromotions,
  );
}
