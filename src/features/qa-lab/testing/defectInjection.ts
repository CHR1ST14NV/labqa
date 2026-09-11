// Modo defecto educativo del QA Lab.
//
// Diseño deliberado para que el defecto NUNCA pueda arrastrar consigo el
// oráculo del test:
//   - Esta constante identifica la ÚNICA regla que el defecto puede alterar
//     (T11: SHIPPED + CANCEL_ORDER). Esa regla en transitions.ts sigue
//     diciendo permitted:false — es la fuente de verdad y no se toca.
//   - El motor (stateMachine.ts) es el único lugar que consulta este flag,
//     y solo cuando el llamador pide explícitamente defectModeEnabled=true.
//   - Los casos de prueba (testCases.ts) definen su "esperado" de forma
//     literal e independiente de este archivo y de transitions.ts: TE-009
//     siempre espera { success:false, resultingState: SHIPPED }, sin
//     importar si el modo defecto está activo. Por eso, con el defecto
//     encendido, "esperado" no cambia pero "obtenido" sí — y el runner
//     reporta FAIL correctamente en vez de un PASS artificial.
export const DEFECT_INJECTABLE_RULE_ID = "T11";

export const DEFECT_MODE_DESCRIPTION =
  "Introduce deliberadamente una violación de una regla para demostrar cómo un caso de prueba detecta el defecto.";

export const DEFECT_MODE_EXPLANATION =
  "Con el modo defecto activo, SHIPPED + CANCEL_ORDER se acepta incorrectamente y mueve el pedido a CANCELLED. El caso TE-009 sigue esperando RECHAZADO/SHIPPED, así que el runner lo marca FAIL y explica qué regla de negocio se violó.";

export function isDefectTarget(ruleId: string | undefined): boolean {
  return ruleId === DEFECT_INJECTABLE_RULE_ID;
}
