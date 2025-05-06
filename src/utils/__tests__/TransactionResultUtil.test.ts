import {
  evaluateClosePaymentResultError,
  ViewOutcomeEnum,
} from "../transactions/TransactionResultUtil";

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe("Should return proper outcome based on different nodeInfo values", () => {
  const testCases = [
    {
      description:
        "should return GENERIC_ERROR when closePaymentResultError is undefined",
      input: undefined,
      expected: ViewOutcomeEnum.GENERIC_ERROR,
    },
    {
      description:
        "should return REFUNDED for status code 422 with description 'Node did not receive RPT yet'",
      input: { statusCode: 422, description: "Node did not receive RPT yet" },
      expected: ViewOutcomeEnum.REFUNDED,
    },
    {
      description:
        "should return GENERIC_ERROR for status code 422 without description",
      input: { statusCode: 422 },
      expected: ViewOutcomeEnum.GENERIC_ERROR,
    },
    {
      description: "should return REFUNDED for status code 400",
      input: { statusCode: 400 },
      expected: ViewOutcomeEnum.REFUNDED,
    },
    {
      description: "should return REFUNDED for status code 404",
      input: { statusCode: 404 },
      expected: ViewOutcomeEnum.REFUNDED,
    },
    {
      description: "should return GENERIC_ERROR for status code 500",
      input: { statusCode: 500 },
      expected: ViewOutcomeEnum.GENERIC_ERROR,
    },
    {
      description: "should return GENERIC_ERROR for status code 503",
      input: { statusCode: 503 },
      expected: ViewOutcomeEnum.GENERIC_ERROR,
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      expect(evaluateClosePaymentResultError(input)).toEqual(expected);
    });
  });
});
