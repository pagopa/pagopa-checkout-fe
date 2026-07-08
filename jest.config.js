module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  testPathIgnorePatterns: [
    "dist",
    "/node_modules",
    "/src/utils/testing",
    "/src/routes/__tests__/_model.ts",
  ],

  testMatch: ["**/__tests__/**/*.(tsx|ts)"],

  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test_reports",
        outputName: "checkout-unit-TEST.xml",
      },
    ],
  ],

  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx|mjs)$": "babel-jest",
    "^.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },

  transformIgnorePatterns: ["/node_modules/(?!@pagopa/mui-italia)/"],

  moduleNameMapper: {
    "^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!<rootDir>/src/index.ts",
    "!<rootDir>/src/instrumentation.ts",
    "!<rootDir>/src/__tests__/**/*",
    "!<rootDir>/src/__integration_tests__/**/*",
    "!<rootDir>/src/__mocks__/**/*",
  ],

  testResultsProcessor: "jest-sonar-reporter",

  coveragePathIgnorePatterns: [
    "node_modules",
    "test-config",
    ".module.ts",
    "<rootDir>/src/generated/",
    "<rootDir>/src/__mocks__/*.ts",
    "<rootDir>/src/utils/testing",
    "index.ts",
  ],

  coverageDirectory: "<rootDir>/coverage/",
};
