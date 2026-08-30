import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  collectCoverageFrom: ["src/lib/**/*.{ts,tsx}", "!src/generated/**"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default createJestConfig(config);
