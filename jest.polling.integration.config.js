module.exports = {
  preset: "jest-puppeteer",
  testRegex: String.raw`./polling.integration.test\.ts$`,
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-polling-integration-TEST.xml',
      } ]
    ]
  };