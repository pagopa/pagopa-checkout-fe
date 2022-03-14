module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist", "/node_modules", "/e2e-tests"],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './test_reports',
      outputName: 'io-pay-portal-fe-TEST.xml',
    } ]
  ],
  coverageReporters: ["cobertura"]
};
