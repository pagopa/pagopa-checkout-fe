module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist", "/node_modules"],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './test_reports',
      outputName: 'io-pay-portal-fe-TEST.xml',
    } ]
  ],
  coverageReporters: ["cobertura"]
};
