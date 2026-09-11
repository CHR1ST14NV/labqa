import { defineConfig } from "vitest/config";

// Config de Vitest del módulo académico LABQA.
//
// Corre únicamente los tests puros de src/features/qa-lab/**. No usa jsdom
// ni React Testing Library porque el dominio es lógica pura (sin DOM).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/features/qa-lab/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/features/qa-lab/domain/**", "src/features/qa-lab/testing/**"],
      reporter: ["text", "html"],
    },
  },
});
