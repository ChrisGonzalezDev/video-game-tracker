/** @type {import("jest").Config} */
module.exports = {
  clearMocks: true,
  testEnvironment: "<rootDir>/jest.environment.cjs",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          allowImportingTsExtensions: true,
          esModuleInterop: true,
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
};
