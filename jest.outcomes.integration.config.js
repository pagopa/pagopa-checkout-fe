module.exports = {
  preset: "jest-puppeteer",
  testRegex: String.raw`./outcomes.integration.test\.ts$`,
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-outcomes-integration-TEST.xml',
      } ]
    ]
  };