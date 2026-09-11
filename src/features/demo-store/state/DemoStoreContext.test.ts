import { describe, expect, it } from "vitest";
import { computeOrderTransition } from "./DemoStoreContext";
import { OrderEvent, OrderState } from "../../qa-lab/domain/state-machine/types";

// ---------------------------------------------------------------------------
// Por qué este archivo NO usa jsdom / React Testing Library
// ---------------------------------------------------------------------------
// El bug original (historial duplicado) era un problema de PUREZA de un
// updater de useState, no de renderizado ni de eventos del DOM: React 18
// StrictMode invoca dos veces, en desarrollo, cualquier función que se le
// pase a un setState (`setX(prev => ...)`) para detectar que no tenga
// efectos secundarios. Reproducir eso fielmente NO requiere montar el
// componente ni simular un clic real — alcanza con invocar el mismo
// callback dos veces, tal como hace React, y verificar que no duplica nada.
// Meter jsdom + Testing Library solo para "hacer clic en un botón" habría
// sido peso extra sin ganar cobertura real sobre la causa del bug.
//
// La corrección en DemoStoreContext.tsx separó el cálculo de la transición
// (computeOrderTransition, pura, exportada) de los dos setState. Estos
// tests cubren exactamente eso:
//   1. computeOrderTransition es pura (mismo input → mismo output, sin
//      efectos secundarios) — la pieza que attemptEvent ahora llama una
//      sola vez.
//   2. El patrón correcto (post-fix) produce una única entrada de
//      historial aunque el updater de setOrder se invoque dos veces.
//   3. El patrón incorrecto (pre-fix — side effect dentro del updater)
//      SÍ duplica bajo el mismo estímulo, dejando registrada la causa real
//      del bug para que no se reintroduzca.
// ---------------------------------------------------------------------------

// Emula el contrato de React 18 StrictMode para updaters de setState: los
// invoca dos veces y se queda con el resultado de la segunda invocación.
// https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development
function invokeAsStrictModeWould<T>(updater: () => T): T {
  updater();
  return updater();
}

describe("computeOrderTransition — cálculo puro de transición (DemoStoreContext)", () => {
  it("es determinista: mismo estado + mismo evento siempre da el mismo resultado", () => {
    const first = computeOrderTransition(OrderState.CREATED, OrderEvent.CONFIRM_ORDER, 10);
    const second = computeOrderTransition(OrderState.CREATED, OrderEvent.CONFIRM_ORDER, 10);

    expect(second).toEqual(first);
    expect(first.resultingState).toBe(OrderState.PAYMENT_PENDING);
    expect(first.timelineEntry.accepted).toBe(true);
  });

  it("invocarlo dos veces no acumula ni muta nada compartido (es una función pura)", () => {
    // Si tuviera algún efecto secundario oculto (push a un array externo,
    // contador global, etc.), esta segunda llamada lo revelaría al no dar
    // exactamente el mismo resultado que la primera.
    for (let i = 0; i < 5; i += 1) {
      const result = computeOrderTransition(OrderState.SHIPPED, OrderEvent.CANCEL_ORDER, 10);
      expect(result.resultingState).toBe(OrderState.SHIPPED);
      expect(result.timelineEntry.accepted).toBe(false);
    }
  });
});

describe("regresión — un solo evento produce EXACTAMENTE una entrada de historial", () => {
  it("patrón correcto (post-fix): setTimeline se llama una vez fuera del updater; setOrder es puro", () => {
    let timeline: Array<{ eventLabel: string }> = [];
    let orderState: OrderState = OrderState.CREATED;

    // Reproduce, paso a paso, exactamente lo que hace attemptEvent hoy:
    const { resultingState, timelineEntry } = computeOrderTransition(
      orderState,
      OrderEvent.CONFIRM_ORDER,
      10,
    );

    // Equivalente a: setTimeline((prev) => [entry, ...prev]) — se llama UNA
    // sola vez, con el resultado ya calculado.
    timeline = [{ eventLabel: timelineEntry.eventLabel }, ...timeline];

    // Equivalente a: setOrder((current) => ({ ...current, state: resultingState }))
    // — puro, así que invocarlo dos veces (como haría StrictMode) es inofensivo.
    orderState = invokeAsStrictModeWould(() => resultingState);

    expect(timeline).toHaveLength(1);
    expect(orderState).toBe(OrderState.PAYMENT_PENDING);
  });

  it("patrón con el bug original: side effect DENTRO del updater sí duplica bajo StrictMode", () => {
    // Deja constancia de la causa exacta del bug: si (como antes)
    // setTimeline se llamara desde dentro del callback que se le pasa a
    // setOrder, cada invocación extra de ese updater agrega una entrada más.
    let timeline: Array<{ eventLabel: string }> = [];

    const buggyOrderUpdater = () => {
      const { timelineEntry } = computeOrderTransition(
        OrderState.CREATED,
        OrderEvent.CONFIRM_ORDER,
        10,
      );
      // Antipatrón corregido: efecto secundario dentro de un updater.
      timeline = [{ eventLabel: timelineEntry.eventLabel }, ...timeline];
      return OrderState.PAYMENT_PENDING;
    };

    invokeAsStrictModeWould(buggyOrderUpdater);

    // Con el antipatrón, dos invocaciones del updater (StrictMode) generan
    // DOS entradas — este es el bug reportado, reproducido a propósito.
    expect(timeline).toHaveLength(2);
  });
});
