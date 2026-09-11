import { transitionOrder } from "../domain/state-machine/stateMachine";
import { STATE_TEST_CASES } from "../domain/state-machine/testCases";
import { ORDER_STATE_LABELS, OrderState } from "../domain/state-machine/types";
import { CONDITION_LABELS } from "../domain/decision-table/types";
import { DECISION_RULES } from "../domain/decision-table/rules";
import { DECISION_TEST_CASES } from "../domain/decision-table/testCases";
import { evaluateDecision } from "../domain/decision-table/decisionEngine";

export type QaTechnique = "ESTADOS" | "DECISION";

export interface TestRunResult {
  id: string;
  technique: QaTechnique;
  name: string;
  ruleId: string;
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  details: string;
  timestamp: string;
}

export interface QaRunMetrics {
  total: number;
  passed: number;
  failed: number;
  passRatePercent: number;
  rulesCovered: number;
  durationMs: number;
}

export interface QaRunReport {
  results: TestRunResult[];
  metrics: QaRunMetrics;
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function successLabel(success: boolean, state: OrderState): string {
  return `${success ? "ACEPTADO" : "RECHAZADO"} / ${ORDER_STATE_LABELS[state]}`;
}

// Ejecuta los casos TE-XXX. defectModeEnabled se propaga tal cual al motor;
// el "esperado" de cada caso (testCases.ts) nunca cambia por este flag.
export function runStateMachineSuite(defectModeEnabled: boolean): TestRunResult[] {
  return STATE_TEST_CASES.map((testCase) => {
    let currentState = testCase.initialState;
    let overallSuccess = true;
    let lastRuleId = "NONE";
    let lastMessage = "";

    for (const step of testCase.steps) {
      const result = transitionOrder(currentState, step.event, step.context, {
        defectModeEnabled,
      });
      lastRuleId = result.ruleId;
      lastMessage = result.message;
      currentState = result.resultingState;
      if (!result.success) {
        overallSuccess = false;
        break;
      }
    }

    const pass =
      overallSuccess === testCase.expectedSuccess && currentState === testCase.expectedFinalState;

    const stepsLabel = testCase.steps
      .map((step) => step.event)
      .join(" → ");

    return {
      id: testCase.id,
      technique: "ESTADOS",
      name: testCase.name,
      ruleId: lastRuleId,
      input: `${ORDER_STATE_LABELS[testCase.initialState]} + ${stepsLabel}`,
      expected: successLabel(testCase.expectedSuccess, testCase.expectedFinalState),
      actual: successLabel(overallSuccess, currentState),
      pass,
      details: lastMessage,
      timestamp: new Date().toISOString(),
    };
  });
}

function decisionActionsLabel(actions: { discountPercent: number; rejectCoupon: boolean }): string {
  const discount = `${actions.discountPercent}% descuento`;
  return actions.rejectCoupon ? `${discount}, cupón rechazado` : discount;
}

export function runDecisionTableSuite(): TestRunResult[] {
  return DECISION_TEST_CASES.map((testCase) => {
    const rule = DECISION_RULES.find((candidate) => candidate.id === testCase.ruleId);
    if (!rule) {
      throw new Error(`Regla ${testCase.ruleId} no encontrada para ${testCase.id}`);
    }

    // ACTUAL: se obtiene ejecutando el motor BAJO PRUEBA (evaluateDecision,
    // decisionEngine.ts) en este instante.
    const actualActions = evaluateDecision(rule.conditions);

    // EXPECTED: viene del ORÁCULO explícito del caso (testCase.expected*,
    // calculado en testCases.ts con computeExpectedActions de
    // decisionSpec.ts) — nunca del mismo motor que produjo "actual". Si
    // evaluateDecision tuviera un bug, esta comparación lo detectaría en
    // vez de enmascararlo.
    const pass =
      actualActions.discountPercent === testCase.expectedDiscountPercent &&
      actualActions.rejectCoupon === testCase.expectedCouponRejected;

    const conditionsLabel = (
      Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>
    )
      .map((key) => `${CONDITION_LABELS[key]}=${rule.conditions[key] ? "Sí" : "No"}`)
      .join(", ");

    return {
      id: testCase.id,
      technique: "DECISION",
      name: `Regla ${rule.id}`,
      ruleId: rule.id,
      input: conditionsLabel,
      expected: decisionActionsLabel({
        discountPercent: testCase.expectedDiscountPercent,
        rejectCoupon: testCase.expectedCouponRejected,
      }),
      actual: decisionActionsLabel(actualActions),
      pass,
      details: testCase.description,
      timestamp: new Date().toISOString(),
    };
  });
}

function buildMetrics(results: TestRunResult[], durationMs: number): QaRunMetrics {
  const total = results.length;
  const passed = results.filter((result) => result.pass).length;
  const failed = total - passed;
  const rulesCovered = new Set(results.map((result) => result.ruleId)).size;

  return {
    total,
    passed,
    failed,
    passRatePercent: total === 0 ? 0 : Math.round((passed / total) * 1000) / 10,
    rulesCovered,
    durationMs: Math.round(durationMs * 100) / 100,
  };
}

export function runQaSuite(
  scope: "ESTADOS" | "DECISION" | "ALL",
  defectModeEnabled: boolean,
): QaRunReport {
  const start = now();
  const results: TestRunResult[] = [];

  if (scope === "ESTADOS" || scope === "ALL") {
    results.push(...runStateMachineSuite(defectModeEnabled));
  }
  if (scope === "DECISION" || scope === "ALL") {
    results.push(...runDecisionTableSuite());
  }

  const durationMs = now() - start;
  return { results, metrics: buildMetrics(results, durationMs) };
}
