module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./paymentresponsepagev2.integration.test\\.ts$",
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-paymentResponsePageV2-integration-TEST.xml',
      } ]
    ]
  };