# LABQA — Guía de demostración

Proyecto académico standalone de **Pruebas de Caja Negra** (Transición de
Estados + Tabla de Decisiones). No requiere backend, base de datos, ni
conexión a internet después de instalar dependencias: toda la lógica es
TypeScript determinista que corre en el navegador.

## 1. Qué demuestra el módulo

- **Demo Store**: el software bajo prueba — una tienda simplificada donde se
  arma un pedido, se calcula un descuento y se sigue su ciclo de vida.
- **QA Lab**: la herramienta de pruebas — Transición de Estados (9 estados,
  9 eventos, motor de reglas, diagrama, matriz, simulador, 16 casos `TE-XXX`)
  y Tabla de Decisiones (4 condiciones, 16 combinaciones, tabla visual, 16
  casos `TD-XXX`).
- Un **test runner visual** que ejecuta ambas técnicas (o cada una por
  separado) y muestra métricas Aprobadas/Fallidas, y un **modo de inyección
  de defecto** que permite mostrar en vivo cómo un caso de prueba detecta una
  violación de regla de negocio.

## 2. Ruta para abrirlo

```
http://localhost:3000/
```

`/` abre directamente Demo Store; el botón "Inspeccionar pruebas" lleva a
QA Lab (dentro de la misma app, sin recargar página).

## 3. Cómo ejecutarlo

```bash
npm install
npm run dev
```

También funciona con el build de producción (`npm run build && npm start`).

## 4. Casos principales

- `TE-001` a `TE-015` (casos puntuales) + `TE-E2E-001` (flujo feliz completo).
- `TD-001` a `TD-016` (una por cada combinación de la tabla de decisiones).
- Ver el detalle completo en `docs/QA-LAB-TEST-CASES.md`.

## 5. Cómo hacer una transición inválida

1. Desde Demo Store, clic en **Inspeccionar pruebas** → pestaña **Transición
   de Estados**.
2. En el panel **Simulador**, sección **Prueba negativa**, hacer clic en un
   evento que debería ser bloqueado — por ejemplo, estando en **Enviado**,
   clic en **Cancelar pedido** (caso `TE-009`).
3. El panel muestra **Operación rechazada**, el estado se mantiene igual, y
   el mensaje explica la regla violada.

> **Dos vocabularios distintos, a propósito:** una operación manual (en el
> simulador o en Demo Store) se muestra como **Aceptada** / **Rechazada** —
> es el resultado de ejecutar una transición real, no el veredicto de un
> caso de prueba. **Aprobada** / **Fallida** aparece únicamente en
> Ejecución, Casos de Prueba y Evidencia, donde sí se compara un resultado
> "esperado" (el oráculo del caso) contra un resultado "obtenido".

## 6. Cómo activar el modo defecto

1. En el header de QA Lab, activar el toggle **Defecto** (está OFF por
   defecto).
2. Ir a **Ejecución** → **Ejecutar Transición de Estados** (o **Ejecutar
   Todas las Pruebas**).
3. El caso `TE-009` ahora muestra **FALLIDA**: el motor aceptó
   incorrectamente `SHIPPED + CANCEL_ORDER`, pero el oráculo del test sigue
   esperando `RECHAZADO / Enviado`.

## 7. Cómo mostrar el FALLIDA

Con el modo defecto activo, correr la suite de Transición de Estados desde
**Ejecución**. La fila `TE-009` aparece resaltada en rojo con la etiqueta
**FALLIDA**, y un panel de fallo muestra "Esperado" vs. "Obtenido" lado a
lado con la diferencia explicada.

## 8. Cómo volver a APROBADA

Apagar el toggle **Defecto** y volver a ejecutar la suite (o usar el botón
**Reiniciar**, que también lo apaga automáticamente). `TE-009` vuelve a
mostrar **APROBADA**.

## 9. Cómo exportar evidencia

En **Evidencia**:
- **Copiar**: copia el JSON acumulado al portapapeles.
- **Descargar JSON** / **Descargar CSV**: genera el archivo en el navegador
  (sin backend involucrado).
- El ícono de papelera vacía el log acumulado de esta sesión.

## Aislamiento

- Proyecto 100% standalone: no importa nada de ningún backend, base de
  datos, ni sistema externo. `domain/`, `testing/` y `state/` son
  independientes de cualquier otro proyecto.
- No requiere sesión iniciada ni servicios adicionales.
- Vitest se usa únicamente para probar el dominio puro de QA Lab
  (`npm run test:qa`).
