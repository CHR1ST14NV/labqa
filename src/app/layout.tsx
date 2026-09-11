import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LABQA — Laboratorio de Pruebas de Caja Negra",
  description:
    "Módulo académico standalone: Demo Store (software bajo prueba) + QA Lab (Tabla de Decisiones y Transición de Estados).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
