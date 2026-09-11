import { computeExpectedActions } from "./decisionSpec";
import { CONDITION_LABELS } from "./types";
import { DECISION_RULES } from "./rules";

export interface DecisionTestCase {
  id: string; // TD-001..TD-016
  ruleId: string; // R01..R16
  description: string;
  // Oráculo explícito del caso: sale de computeExpectedActions
  // (decisionSpec.ts), NUNCA de evaluateDecision (decisionEngine.ts, la
  // implementación bajo prueba). El test runner ejecuta evaluateDecision
  // por separado para obtener el "obtenido" y lo compara contra estos dos
  // campos — ver testing/testRunner.ts.
  expectedDiscountPercent: number;
  expectedCouponRejected: boolean;
}

function describeConditions(rule: (typeof DECISION_RULES)[number]): string {
  const parts = (Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>).map(
    (key) => `${CONDITION_LABELS[key]}=${rule.conditions[key] ? "Sí" : "No"}`,
  );
  return parts.join(", ");
}

// Un caso TD por cada una de las 16 combinaciones de DECISION_RULES.
// expectedDiscountPercent/expectedCouponRejected se recalculan aquí mismo
// llamando a computeExpectedActions (el oráculo) sobre las condiciones de
// la regla — no se copian de rule.actions "a ciegas" — para que quede
// explícito, caso por caso, que el esperado no tiene ninguna dependencia
// del motor bajo prueba.
export const DECISION_TEST_CASES: DecisionTestCase[] = DECISION_RULES.map((rule, index) => {
  const expected = computeExpectedActions(rule.conditions);

  return {
    id: `TD-${String(index + 1).padStart(3, "0")}`,
    ruleId: rule.id,
    description: `Combinación ${rule.id}: ${describeConditions(rule)}.`,
    expectedDiscountPercent: expected.discountPercent,
    expectedCouponRejected: expected.rejectCoupon,
  };
});
