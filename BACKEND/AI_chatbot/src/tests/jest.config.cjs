/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/UC7", "<rootDir>/UC6"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../$1", // maps "@/app/openai" to src/app/openai
  },
  testMatch: ["**/*.test.ts"],
  verbose: true,
};
