module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./*checkout.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-integration-TEST.xml',
      } ]
    ]
  };