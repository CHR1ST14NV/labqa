"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { transitionOrder, validEventsFrom } from "../domain/state-machine/stateMachine";
import {
  ORDER_EVENT_LABELS,
  ORDER_STATE_LABELS,
  OrderEvent,
  OrderState,
} from "../domain/state-machine/types";
import { EvidenceEntry, toEvidence } from "../testing/evidence";
import { QaRunReport, QaTechnique, runQaSuite } from "../testing/testRunner";

export interface SimulationHistoryEntry {
  time: string;
  previousStateLabel: string;
  eventLabel: string;
  resultingStateLabel: string;
  ruleId: string;
  pass: boolean;
  message: string;
}

interface QaLabContextValue {
  currentState: OrderState;
  validEvents: OrderEvent[];
  history: SimulationHistoryEntry[];
  defectModeEnabled: boolean;
  presentationMode: boolean;
  daysSinceDelivery: number;
  lastRunReport: QaRunReport | null;
  lastRunScope: QaTechnique | "ALL" | null;
  evidence: EvidenceEntry[];
  attemptEvent: (event: OrderEvent) => void;
  setDaysSinceDelivery: (days: number) => void;
  toggleDefectMode: (enabled: boolean) => void;
  togglePresentationMode: (enabled: boolean) => void;
  runSuite: (scope: QaTechnique | "ALL") => void;
  clearEvidence: () => void;
  resetDemo: () => void;
}

const QaLabContext = createContext<QaLabContextValue | undefined>(undefined);

export function QaLabProvider({ children }: { children: ReactNode }) {
  const [currentState, setCurrentState] = useState<OrderState>(OrderState.CREATED);
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const [defectModeEnabled, setDefectModeEnabled] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [daysSinceDelivery, setDaysSinceDelivery] = useState(10);
  const [lastRunReport, setLastRunReport] = useState<QaRunReport | null>(null);
  const [lastRunScope, setLastRunScope] = useState<QaTechnique | "ALL" | null>(null);
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([]);

  const attemptEvent = useCallback(
    (event: OrderEvent) => {
      const result = transitionOrder(
        currentState,
        event,
        { daysSinceDelivery },
        { defectModeEnabled },
      );

      setHistory((prev) => [
        {
          time: new Date().toLocaleTimeString("es-GT"),
          previousStateLabel: ORDER_STATE_LABELS[result.previousState],
          eventLabel: ORDER_EVENT_LABELS[event],
          resultingStateLabel: ORDER_STATE_LABELS[result.resultingState],
          ruleId: result.ruleId,
          pass: result.success,
          message: result.message,
        },
        ...prev,
      ]);

      setCurrentState(result.resultingState);
    },
    [currentState, daysSinceDelivery, defectModeEnabled],
  );

  const runSuite = useCallback(
    (scope: QaTechnique | "ALL") => {
      const report = runQaSuite(scope, defectModeEnabled);
      setLastRunReport(report);
      setLastRunScope(scope);
      setEvidence((prev) => [...prev, ...toEvidence(report.results)]);
    },
    [defectModeEnabled],
  );

  const clearEvidence = useCallback(() => setEvidence([]), []);

  const resetDemo = useCallback(() => {
    setCurrentState(OrderState.CREATED);
    setHistory([]);
    setDefectModeEnabled(false);
    setLastRunReport(null);
    setLastRunScope(null);
    setEvidence([]);
    setDaysSinceDelivery(10);
  }, []);

  const value = useMemo<QaLabContextValue>(
    () => ({
      currentState,
      validEvents: validEventsFrom(currentState),
      history,
      defectModeEnabled,
      presentationMode,
      daysSinceDelivery,
      lastRunReport,
      lastRunScope,
      evidence,
      attemptEvent,
      setDaysSinceDelivery,
      toggleDefectMode: setDefectModeEnabled,
      togglePresentationMode: setPresentationMode,
      runSuite,
      clearEvidence,
      resetDemo,
    }),
    [
      currentState,
      history,
      defectModeEnabled,
      presentationMode,
      daysSinceDelivery,
      lastRunReport,
      lastRunScope,
      evidence,
      attemptEvent,
      runSuite,
      clearEvidence,
      resetDemo,
    ],
  );

  return <QaLabContext.Provider value={value}>{children}</QaLabContext.Provider>;
}

export function useQaLab(): QaLabContextValue {
  const ctx = useContext(QaLabContext);
  if (!ctx) {
    throw new Error("useQaLab debe usarse dentro de <QaLabProvider>");
  }
  return ctx;
}
