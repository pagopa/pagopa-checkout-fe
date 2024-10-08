module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./paymentflow.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-payment-flow-integration-TEST.xml',
      } ]
    ]
  };