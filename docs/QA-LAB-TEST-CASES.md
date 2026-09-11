# LABQA — Catálogo de casos de prueba

Fuente de verdad en código:
`src/features/qa-lab/domain/state-machine/testCases.ts` y
`src/features/qa-lab/domain/decision-table/testCases.ts`. Esta tabla es un
resumen para el informe; ante cualquier duda, el código manda.

## Transición de Estados (TE-XXX)

En la columna "Resultado esperado", *Éxito* / *Rechazado* describe lo que el
caso de prueba espera que haga la transición en sí (el oráculo, ver
`domain/state-machine/testCases.ts`) — no es ni el badge Aceptada/Rechazada
del simulador manual ni Aprobada/Fallida del test runner. El test runner
compara ese oráculo contra lo que realmente devuelve `transitionOrder()` y
reporta Aprobada o Fallida según coincidan o no.

| ID | Objetivo | Resultado esperado | Regla cubierta |
|---|---|---|---|
| TE-001 | Confirmar pedido | Éxito → Pendiente de pago | T01 |
| TE-002 | Pago aprobado | Éxito → Pagado | T02 |
| TE-003 | Pago rechazado mantiene pendiente de pago | Éxito → Pendiente de pago (registra intento fallido) | T03 |
| TE-004 | Inicio de preparación | Éxito → En preparación | T04 |
| TE-005 | Despacho | Éxito → Enviado | T05 |
| TE-006 | Entrega | Éxito → Entregado | T06 |
| TE-007 | Cancelación desde CREATED | Éxito → Cancelado | T07 |
| TE-008 | Cancelación desde PAYMENT_PENDING | Éxito → Cancelado | T08 |
| TE-009 | Intentar cancelar un pedido enviado | **Rechazado** → se mantiene Enviado | T11 (caso demo de inyección de defecto) |
| TE-010 | Intentar cancelar un pedido entregado | **Rechazado** → se mantiene Entregado | T12 |
| TE-011 | Devolución dentro de 30 días | Éxito → Devolución solicitada | T14 |
| TE-012 | Devolución después de 30 días | **Rechazado** → se mantiene Entregado | T14 (guard condition) |
| TE-013 | Aprobar devolución | Éxito → Devuelto | T15 |
| TE-014 | Transición desde CANCELLED | **Rechazado** (estado terminal) | T16 |
| TE-015 | Transición desde RETURNED | **Rechazado** (estado terminal) | T17 |
| TE-E2E-001 | Flujo feliz completo (Creado → Entregado) | Éxito, 5 pasos | T01, T02, T04, T05, T06 |

## Tabla de Decisiones (TD-XXX)

16 casos, uno por cada combinación binaria de C1 (VIP), C2 (Compra >= Q500),
C3 (Cupón válido) y C4 (Permite promociones).

**Oráculo independiente de la implementación.** El "esperado" de cada caso
(`expectedDiscountPercent` / `expectedCouponRejected` en
`domain/decision-table/testCases.ts`) sale de `computeExpectedActions()`
(`domain/decision-table/decisionSpec.ts`) — una segunda implementación de la
política de negocio, escrita aparte y sin importar nada de
`decisionEngine.ts`. El "obtenido" sale de ejecutar `evaluateDecision()`
(`decisionEngine.ts`), que es el motor bajo prueba. El test runner
(`testing/testRunner.ts`) compara ambos: si coinciden, Aprobada; si no,
Fallida. Así, un bug introducido en `evaluateDecision` nunca puede arrastrar
consigo el valor esperado — quedaría detectado como Fallida, no enmascarado.
(`DECISION_RULES` en `rules.ts` también usa `computeExpectedActions`, no
`evaluateDecision`: la tabla de reglas es la especificación, no un espejo de
la implementación.)

| ID | Regla | Resumen de política aplicada |
|---|---|---|
| TD-001..TD-016 | R01..R16 | Si `allowsPromotions=false`: 0% de descuento siempre, y si además `couponValid=true`, se rechaza el cupón. Si `allowsPromotions=true`: +5% VIP, +5% compra ≥ Q500, +10% cupón válido, acumulable con techo de 20%. |

Ejemplos verificados con tests unitarios independientes entre sí
(`decisionEngine.test.ts` para la implementación, `decisionSpec.test.ts`
para el oráculo):

| Condiciones | Resultado |
|---|---|
| VIP + ≥Q500 + cupón válido + promociones | 20% |
| VIP + <Q500 + sin cupón + promociones | 5% |
| No VIP + ≥Q500 + cupón válido + promociones | 15% |
| Cualquier combinación con promociones=NO | 0% |
| Cupón válido + promociones=NO | 0% + cupón rechazado |

La lista completa y literal de las 16 filas (condiciones exactas de cada
`R01..R16`) se ve en vivo en QA Lab → pestaña **Tabla de Decisiones**, o
leyendo `DECISION_RULES` en `rules.ts`.
