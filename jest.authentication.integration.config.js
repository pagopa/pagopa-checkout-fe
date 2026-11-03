module.exports = {
  preset: "jest-puppeteer",
  testRegex: String.raw`./authentication.integration.test\.ts$`,
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'checkout-authentication-integration-TEST.xml',
      } ]
    ]
  };