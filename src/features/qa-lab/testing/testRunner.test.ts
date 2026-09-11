import { describe, expect, it, vi } from "vitest";
import { runDecisionTableSuite, runStateMachineSuite } from "./testRunner";
import { DECISION_TEST_CASES } from "../domain/decision-table/testCases";
import { STATE_TEST_CASES } from "../domain/state-machine/testCases";
import * as decisionEngineModule from "../domain/decision-table/decisionEngine";

describe("runStateMachineSuite — oráculo independiente del modo defecto", () => {
  it("TE-009 da PASS cuando el modo defecto está OFF", () => {
    const results = runStateMachineSuite(false);
    const te009 = results.find((result) => result.id === "TE-009");
    expect(te009).toBeDefined();
    expect(te009?.pass).toBe(true);
  });

  it("TE-009 da FAIL cuando el modo defecto está ON, aunque el esperado no cambió", () => {
    const off = runStateMachineSuite(false).find((result) => result.id === "TE-009");
    const on = runStateMachineSuite(true).find((result) => result.id === "TE-009");

    expect(on?.pass).toBe(false);
    // El oráculo (columna "esperado") es idéntico con o sin defecto: lo que
    // cambia es únicamente lo "obtenido".
    expect(on?.expected).toBe(off?.expected);
    expect(on?.actual).not.toBe(off?.actual);
  });

  it("el resto de casos TE no se ve afectado por el modo defecto", () => {
    const off = runStateMachineSuite(false);
    const on = runStateMachineSuite(true);

    const unaffected = off.filter((result) => result.id !== "TE-009");
    const unaffectedOn = on.filter((result) => result.id !== "TE-009");

    unaffected.forEach((result, index) => {
      expect(result.pass).toBe(true);
      expect(unaffectedOn[index].pass).toBe(true);
    });
  });

  it("ejecuta exactamente los casos definidos en STATE_TEST_CASES", () => {
    const results = runStateMachineSuite(false);
    expect(results).toHaveLength(STATE_TEST_CASES.length);
    expect(results.every((result) => result.pass)).toBe(true);
  });
});

describe("runDecisionTableSuite", () => {
  it("ejecuta las 16 combinaciones y todas dan PASS contra el motor real", () => {
    const results = runDecisionTableSuite();
    expect(results).toHaveLength(DECISION_TEST_CASES.length);
    expect(results).toHaveLength(16);
    expect(results.every((result) => result.pass)).toBe(true);
  });

  // Prueba de independencia del oráculo: si evaluateDecision (el motor bajo
  // prueba) devolviera un valor incorrecto, el runner debe reportarlo como
  // FAIL — nunca "arrastrar" el error hacia el esperado. Esto demuestra que
  // "expected" (testCases.ts / decisionSpec.ts) y "actual"
  // (evaluateDecision) NO están acoplados: son dos códigos distintos.
  it("detecta un defecto simulado en evaluateDecision en vez de enmascararlo", () => {
    const spy = vi.spyOn(decisionEngineModule, "evaluateDecision").mockReturnValue({
      discountPercent: 0,
      rejectCoupon: false,
    });

    try {
      const results = runDecisionTableSuite();
      // Con TODAS las combinaciones devolviendo el mismo valor incorrecto,
      // cualquier caso cuyo esperado real no sea "0% sin rechazar cupón"
      // debe fallar.
      const anyFailure = results.some((result) => !result.pass);
      expect(anyFailure).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});
