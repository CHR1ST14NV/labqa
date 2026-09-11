"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  PlayCircle,
  RotateCcw,
  Table2,
} from "lucide-react";
import { Metric, Panel, PresentationBadge, SectionHeader } from "./kit";
import { StateDiagram } from "./StateDiagram";
import { TransitionMatrix } from "./TransitionMatrix";
import { StateSimulator } from "./StateSimulator";
import { DecisionTable } from "./DecisionTable";
import { TestCases } from "./TestCases";
import { TestRunner } from "./TestRunner";
import { EvidenceLog } from "./EvidenceLog";
import { STATE_TEST_CASES } from "../domain/state-machine/testCases";
import { TRANSITION_RULES } from "../domain/state-machine/transitions";
import { DECISION_TEST_CASES } from "../domain/decision-table/testCases";
import { DECISION_RULES } from "../domain/decision-table/rules";
import { QaLabProvider, useQaLab } from "../state/QaLabContext";
import { DemoStoreApp } from "../../demo-store/components/DemoStoreApp";
import { DemoStoreProvider } from "../../demo-store/state/DemoStoreContext";

type QaScreen = "overview" | "estados" | "decision" | "casos" | "ejecucion" | "evidencia";
type Mode = "product" | "qa";

const QA_SCREENS: Array<{ key: QaScreen; label: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Resumen", icon: LayoutDashboard },
  { key: "estados", label: "Transición de Estados", icon: GitBranch },
  { key: "decision", label: "Tabla de Decisiones", icon: Table2 },
  { key: "casos", label: "Casos de Prueba", icon: ListChecks },
  { key: "ejecucion", label: "Ejecución", icon: PlayCircle },
  { key: "evidencia", label: "Evidencia", icon: ClipboardCheck },
];

const TOTAL_CASES = STATE_TEST_CASES.length + DECISION_TEST_CASES.length;
const TOTAL_RULES = TRANSITION_RULES.length + DECISION_RULES.length;
const SHELL_WIDTH = "mx-auto w-full max-w-[1440px]";

export function QaDashboard() {
  return (
    <QaLabProvider>
      <DemoStoreProvider>
        <ModeSwitcher />
      </DemoStoreProvider>
    </QaLabProvider>
  );
}

function ModeSwitcher() {
  const [mode, setMode] = useState<Mode>("product");

  if (mode === "product") {
    return <DemoStoreApp onGoToQaLab={() => setMode("qa")} />;
  }

  return <QaLabShell onExit={() => setMode("product")} />;
}

function QaLabShell({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<QaScreen>("overview");
  const {
    defectModeEnabled,
    toggleDefectMode,
    presentationMode,
    togglePresentationMode,
    resetDemo,
  } = useQaLab();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className={`${SHELL_WIDTH} flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-sm font-semibold text-slate-400 transition-colors hover:text-slate-700"
            >
              Demo Store
            </button>
            <span className="text-slate-300">/</span>
            <div>
              <p className="text-[15px] font-bold text-slate-900">QA Lab</p>
              <p className="text-xs text-slate-400">Laboratorio de Pruebas de Caja Negra</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {presentationMode ? <PresentationBadge /> : null}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-1 py-1">
              <MiniToggle
                active={presentationMode}
                onClick={() => togglePresentationMode(!presentationMode)}
                label="Modo presentación"
              />
              <MiniToggle
                active={defectModeEnabled}
                onClick={() => toggleDefectMode(!defectModeEnabled)}
                label="Inyección de defecto"
                danger
              />
            </div>
            <Button variant="outline" size="sm" onClick={resetDemo} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </Button>
          </div>
        </div>

        {defectModeEnabled ? (
          <div className="border-t border-rose-200 bg-rose-600 px-6 py-2.5 text-center text-white lg:px-10">
            <p className="text-[13px] font-bold uppercase tracking-wide">
              Inyección de defecto activa
            </p>
            <p className="mt-0.5 text-[12.5px] font-medium text-rose-50">
              Se alteró deliberadamente la regla T11 para demostrar la detección de un defecto.
            </p>
          </div>
        ) : null}

        <nav
          className={`${SHELL_WIDTH} flex flex-wrap gap-1 px-6 pb-3 lg:px-10 ${
            presentationMode ? "pt-1" : ""
          }`}
        >
          {QA_SCREENS.map((item) => {
            const Icon = item.icon;
            const active = screen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setScreen(item.key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                  active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className={`${SHELL_WIDTH} px-6 py-8 lg:px-10 ${presentationMode ? "max-w-[1600px]" : ""}`}>
        {screen === "overview" ? <OverviewScreen onNavigate={setScreen} /> : null}
        {screen === "estados" ? <StateTestingScreen /> : null}
        {screen === "decision" ? (
          <div className="space-y-6">
            <SectionHeader eyebrow="Tabla de Decisiones" title="Tabla de Decisiones" />
            <DecisionTable />
          </div>
        ) : null}
        {screen === "casos" ? (
          <div className="space-y-6">
            <SectionHeader eyebrow="Casos de Prueba" title="Catálogo de casos" />
            <TestCases />
          </div>
        ) : null}
        {screen === "ejecucion" ? <TestRunner /> : null}
        {screen === "evidencia" ? <EvidenceLog /> : null}
      </main>
    </div>
  );
}

function MiniToggle({
  active,
  onClick,
  label,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? danger
            ? "bg-rose-600 text-white"
            : "bg-blue-600 text-white"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function OverviewScreen({ onNavigate }: { onNavigate: (screen: QaScreen) => void }) {
  const { lastRunReport } = useQaLab();
  const passRate = lastRunReport ? lastRunReport.metrics.passRatePercent : null;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">QA Lab</p>
        <h1 className="mt-1 text-[2.5rem] font-bold leading-tight tracking-tight text-slate-900">
          Laboratorio de Pruebas de Caja Negra
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-slate-500">
          Diseño, ejecución y evidencia de pruebas mediante Tabla de Decisiones y Transición de
          Estados sobre el Módulo de Gestión de Pedidos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        <Metric label="Casos de prueba" value={TOTAL_CASES} big />
        <Metric
          label="Aprobados"
          value={
            passRate !== null ? (
              `${passRate}%`
            ) : (
              <span className="block text-2xl tracking-wide">SIN EJECUTAR</span>
            )
          }
          tone={passRate !== null ? "green" : "neutral"}
          big
        />
        <Metric label="Reglas" value={TOTAL_RULES} big />
        <Metric label="Técnicas" value={2} big />
      </div>

      <div>
        <SectionHeader eyebrow="Cobertura" title="Técnicas" />
        <div className="grid gap-4 sm:grid-cols-2">
          <CoverageCard
            icon={GitBranch}
            title="Transición de Estados"
            caption={`${STATE_TEST_CASES.length} casos · ${TRANSITION_RULES.length} reglas`}
            ratio={1}
            onClick={() => onNavigate("estados")}
          />
          <CoverageCard
            icon={Table2}
            title="Tabla de Decisiones"
            caption={`${DECISION_TEST_CASES.length} casos · ${DECISION_RULES.length} reglas`}
            ratio={1}
            onClick={() => onNavigate("decision")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NavCard
          icon={ListChecks}
          title="Casos de Prueba"
          description="Explorá TE-XXX y TD-XXX."
          onClick={() => onNavigate("casos")}
        />
        <NavCard
          icon={PlayCircle}
          title="Ejecución"
          description="Ejecutá las suites y mirá aprobadas/fallidas."
          onClick={() => onNavigate("ejecucion")}
        />
        <NavCard
          icon={ClipboardCheck}
          title="Evidencia"
          description="Exportá evidencia en JSON/CSV."
          onClick={() => onNavigate("evidencia")}
        />
      </div>

      <Panel className="bg-slate-50/60">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-blue-700">Transición de Estados</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
              Evalúa cómo cambia el comportamiento del sistema según su estado actual y los eventos
              recibidos.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-violet-700">Tabla de Decisiones</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
              Evalúa combinaciones de condiciones y las acciones que corresponden a cada combinación.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function CoverageCard({
  icon: Icon,
  title,
  caption,
  ratio,
  onClick,
}: {
  icon: typeof GitBranch;
  title: string;
  caption: string;
  ratio: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Panel className="transition-transform duration-150 hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400">{caption}</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${ratio * 100}%` }} />
        </div>
      </Panel>
    </button>
  );
}

function NavCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof FlaskConical;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Panel className="transition-transform duration-150 hover:-translate-y-0.5">
        <Icon className="h-5 w-5 text-blue-600" />
        <p className="mt-3 font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </Panel>
    </button>
  );
}

function StateTestingScreen() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Transición de Estados" title="Máquina de Estados" />
      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <StateDiagram />
        <StateSimulator />
      </div>
      <TransitionMatrix />
    </div>
  );
}
