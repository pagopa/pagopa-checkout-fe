module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["dist", "/node_modules"],
  testRegex: "./*test\\.ts$",
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './test_reports',
      outputName: 'checkout-unit-TEST.xml',
    } ]
  ],
  coverageReporters: ["cobertura"],
  modulePathIgnorePatterns: ["__integration_tests__"]
};
