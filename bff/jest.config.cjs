/** @type {import("jest").Config} */
module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          isolatedModules: true,
        },
      },
    ],
  },
};
