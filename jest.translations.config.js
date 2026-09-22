module.exports = {
  preset: 'ts-jest',
  testRegex: './test-translations\\.spec\\.ts$',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es2015',
        module: 'commonjs',
      },
    },
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test_reports',
      outputName: 'checkout-translations-TEST.xml',
    }]
  ]
};