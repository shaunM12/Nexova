import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/candidate-engine/**/*.test.ts"],
    environment: "node",
  },
});
