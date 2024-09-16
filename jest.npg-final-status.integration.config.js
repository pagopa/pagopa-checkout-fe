module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./npg-final-status.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-integration-TEST.xml',
      } ]
    ]
  };