import { QaDashboard } from "@/features/qa-lab/components/QaDashboard";

// Entrada principal de LABQA. "/" abre directamente el módulo académico
// (Demo Store primero, con acceso a QA Lab desde ahí) — no hace falta
// ninguna ruta adicional para llegar a la funcionalidad completa.
export default function Home() {
  return <QaDashboard />;
}
