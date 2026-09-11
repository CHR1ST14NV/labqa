# LABQA

## Laboratorio de Pruebas de Caja Negra

Proyecto académico **standalone**: Demo Store (software bajo prueba) + QA Lab
(herramienta de diseño, ejecución y evidencia de pruebas). No depende de
ningún backend, base de datos ni servicio externo.

## 1. Objetivo

Demostrar dos técnicas de Pruebas de Caja Negra —**Tabla de Decisiones** y
**Transición de Estados**— sobre un caso académico concreto (un módulo de
gestión de pedidos de una tienda), con un prototipo funcional que permite
diseñar reglas, ejecutar casos sistemáticamente y generar evidencia real.

## 2. Software bajo prueba

**Demo Store** simula una tienda electrónica simplificada:
- Un formulario de checkout calcula un descuento (motor de Tabla de
  Decisiones) sobre un pedido (cliente, producto, precio, VIP, cupón,
  promociones).
- Al crear el pedido, la app pasa a una vista de detalle con su ciclo de
  vida completo: progreso visual, próxima acción disponible y actividad
  reciente.
- El botón **Inspeccionar pruebas** lleva a QA Lab sin salir de la app.

## 3. Técnicas implementadas

- **Transición de Estados**: ciclo de vida de un PEDIDO (9 estados, 9
  eventos), con un motor de reglas centralizado, diagrama interactivo,
  matriz de transición, simulador manual y 16 casos `TE-XXX` (incluye un
  flujo E2E).
- **Tabla de Decisiones**: motor de descuentos con 4 condiciones binarias
  (VIP, compra ≥ Q500, cupón válido, permite promociones), las 16
  combinaciones posibles, tabla visual seleccionable y 16 casos `TD-XXX`.

Ambas técnicas comparten un principio de diseño: el **oráculo** de cada caso
de prueba (lo que "debería" pasar) está escrito de forma independiente de la
implementación bajo prueba, para que un bug real se detecte como caso
fallido en vez de quedar enmascarado. Ver `docs/QA-LAB-TEST-CASES.md`.

## 4. Arquitectura

```
src/
├── app/                        # Next.js App Router — "/" abre LABQA directo
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/ui/               # Primitivos de UI (Button, Input, Label)
├── lib/utils.ts                 # Helper cn()
└── features/
    ├── qa-lab/
    │   ├── domain/               # Lógica pura: máquina de estados y motor de decisiones
    │   │   ├── state-machine/    # types, states, transitions, stateMachine, testCases
    │   │   └── decision-table/   # types, rules, decisionEngine, decisionSpec, testCases
    │   ├── testing/              # testRunner, evidence, defectInjection
    │   ├── state/                # QaLabContext (estado de React)
    │   └── components/           # kit.tsx + pantallas de QA Lab
    └── demo-store/
        ├── state/                # DemoStoreContext (estado de React)
        └── components/           # Pantallas de Demo Store
```

`domain/` y `testing/` son TypeScript puro (sin React, sin DOM, sin red).
`components/` consume ese dominio pero nunca lo duplica.

## 5. Instalación

```bash
npm install
```

No requiere ninguna conexión a internet posterior a este paso.

## 6. Ejecución

```bash
npm run dev
```

Abrir [http://localhost:3000/](http://localhost:3000/) — abre LABQA
directamente, sin rutas adicionales.

Build de producción:

```bash
npm run build
npm start
```

## 7. Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run typecheck` | Verifica tipos de TypeScript |
| `npm run lint` | ESLint |
| `npm run test:qa` | Corre los tests de Vitest del dominio de QA Lab |
| `npm run test:qa:coverage` | Igual, con reporte de cobertura |

## 8. Tabla de Decisiones

Motor de descuentos con 4 condiciones (C1 VIP, C2 Compra ≥ Q500, C3 Cupón
válido, C4 Permite promociones) y 16 combinaciones (`R01`..`R16`). Política:
si `allowsPromotions=false` el descuento es siempre 0% (y se rechaza el
cupón si se intentó usar); si es `true`, se acumulan +5% VIP, +5% compra ≥
Q500 y +10% cupón válido, con techo de 20%. Ver la pestaña **Tabla de
Decisiones** en QA Lab, o `src/features/qa-lab/domain/decision-table/`.

## 9. Transición de Estados

Ciclo de vida del PEDIDO: `Creado → Pendiente de pago → Pagado → En
preparación → Enviado → Entregado`, con rama de cancelación (antes de
enviar) y de devolución (dentro de 30 días tras la entrega). 17 reglas
(`T01`..`T17`) centralizadas en `transitions.ts`. Ver la pestaña
**Transición de Estados** en QA Lab.

## 10. Casos TE/TD

32 casos en total: `TE-001`..`TE-015` + `TE-E2E-001` (Transición de Estados)
y `TD-001`..`TD-016` (Tabla de Decisiones). Detalle completo en
`docs/QA-LAB-TEST-CASES.md` y en la pestaña **Casos de Prueba**.

## 11. Inyección de defecto

QA Lab incluye un modo educativo (toggle **Defecto**, OFF por defecto) que
altera deliberadamente la regla `T11` (SHIPPED + CANCEL_ORDER) para que el
motor acepte incorrectamente una cancelación que debería rechazarse. El
oráculo del caso `TE-009` no cambia con el defecto activo — por eso el
runner lo reporta como **Fallida**, demostrando que el caso de prueba
efectivamente detecta el defecto. Ver `src/features/qa-lab/testing/defectInjection.ts`.

## 12. Evidencia

Cada ejecución de suite genera registros (timestamp, caso, técnica, regla,
entrada, esperado, obtenido, resultado) exportables como JSON o CSV, o
copiables al portapapeles — todo en el navegador, sin backend. Ver la
pestaña **Evidencia**.

## 13. Guía de demostración

Ver `docs/QA-LAB-DEMO.md` para el recorrido completo sugerido: crear un
pedido en Demo Store, avanzar su ciclo de vida, pasar a QA Lab, ejecutar las
pruebas, activar el modo defecto y mostrar cómo se detecta.
