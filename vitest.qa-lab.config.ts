import { defineConfig } from "vitest/config";

// Config de Vitest del módulo académico LABQA.
//
// Corre únicamente tests puros (sin DOM): los de src/features/qa-lab/** y
// el/los de src/features/demo-store/state/** (regresión de la lógica de
// transición del Demo Store, extraída como función pura — ver
// DemoStoreContext.tsx / DemoStoreContext.test.ts). No usa jsdom ni React
// Testing Library porque nada de esto necesita renderizar componentes.
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/features/qa-lab/**/*.test.ts",
      "src/features/demo-store/state/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["src/features/qa-lab/domain/**", "src/features/qa-lab/testing/**"],
      reporter: ["text", "html"],
    },
  },
});
