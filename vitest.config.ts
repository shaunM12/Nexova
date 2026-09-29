import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const alias = { "@": path.resolve(__dirname) };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "engine",
          include: ["lib/candidate-engine/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "pipeline",
          include: [
            "lib/backoffice/**/*.test.{ts,tsx}",
            "components/backoffice/**/*.test.tsx",
            "middleware.test.ts",
          ],
          environment: "jsdom",
          env: { NEXT_PUBLIC_PIPELINE_API_URL: "demo" },
          setupFiles: ["./vitest.setup.pipeline.ts"],
        },
      },
    ],
  },
});
