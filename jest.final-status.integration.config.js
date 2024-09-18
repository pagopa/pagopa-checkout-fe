module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./finalstatus.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-final-status-integration-TEST.xml',
      } ]
    ]
  };