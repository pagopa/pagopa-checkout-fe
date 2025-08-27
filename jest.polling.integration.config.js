module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./polling.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-polling-integration-TEST.xml',
      } ]
    ]
  };