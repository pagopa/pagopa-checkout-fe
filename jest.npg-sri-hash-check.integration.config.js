module.exports = {
  preset: "jest-puppeteer",
  testRegex: String.raw`./npg-sri-hash-check.test\.ts$`,
  reporters: [
      'default',
      [ 'jest-junit', {
        outputDirectory: './test_reports',
        outputName: 'npg-sri-hash-check-TEST.xml',
      } ]
    ]
  };