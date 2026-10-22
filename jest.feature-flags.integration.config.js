module.exports = {
  preset: "jest-puppeteer",
  testRegex: String.raw`./featureFlags.integration.test\.ts$`,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test_reports",
        outputName: "feature-flags-integration-TEST.xml",
      },
    ],
  ],
};
