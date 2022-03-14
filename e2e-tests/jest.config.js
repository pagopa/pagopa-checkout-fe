module.exports = {
    preset: "jest-puppeteer",
    testRegex: "./*.test\\.js$",
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: './test_reports',
          outputName: 'checkout-ui-TEST.xml',
        } ]
      ]
    };