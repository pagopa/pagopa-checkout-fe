/* eslint-disable functional/immutable-data */

const mockGetTransactionOutcomes = jest.fn();
const mockCreateClientFn = jest.fn(() => ({
  getTransactionOutcomes: mockGetTransactionOutcomes,
}));

jest.mock(
  "../../../../generated/definitions/payment-ecommerce/NewTransactionResponse",
  () => ({
    NewTransactionResponse: {
      decode: jest.fn((v: unknown) => ({ _tag: "Right", right: v })),
    },
  })
);

jest.mock("../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  clearSessionItem: jest.fn(),
  SessionItems: {
    transaction: "transaction",
    outcome: "outcome",
    totalAmount: "totalAmount",
    authToken: "authToken",
  },
}));

jest.mock("../../config/mixpanelHelperInit", () => ({
  mixpanel: { track: jest.fn() },
}));

jest.mock("../../regex/urlUtilities");

jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
}));

jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "test",
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
    CHECKOUT_API_TIMEOUT: 5000,
    CHECKOUT_API_RETRY_NUMBERS: 2,
    CHECKOUT_API_RETRY_DELAY: 10,
  })),
}));

jest.mock("../../../../generated/definitions/payment-ecommerce/client", () => ({
  __esModule: true,
  createClient: mockCreateClientFn,
}));

import { callServices, decodeToUUID } from "../../api/response";

import {
  getSessionItem as originalGetSessionItem,
  setSessionItem as originalSetSessionItem,
  clearSessionItem as originalClearSessionItem,
  SessionItems,
} from "../../storage/sessionStorage";
import { getUrlParameter as originalGetUrlParameter } from "../../regex/urlUtilities";
import { mixpanel as originalMixpanel } from "../../config/mixpanelHelperInit";

const getSessionItem = originalGetSessionItem as jest.Mock;
const setSessionItem = originalSetSessionItem as jest.Mock;
const clearSessionItem = originalClearSessionItem as jest.Mock;
const getUrlParameter = originalGetUrlParameter as jest.Mock;
const mixpanel = {
  track: originalMixpanel.track as jest.Mock,
};

const onComplete = jest.fn();
const sessionTx = { transactionId: "tx-id-session", authToken: "tok-session" };
const TestViewOutcomeEnum = {
  SUCCESS: "0",
  GENERIC_ERROR: "1",
  PSP_ERROR: "25",
};

const consoleErrorSpy = jest.spyOn(console, "error");
// eslint-disable-next-line @typescript-eslint/no-empty-function
beforeAll(() => consoleErrorSpy.mockImplementation(() => {}));
afterAll(() => consoleErrorSpy.mockRestore());

describe("decodeToUUID", () => {
  it("decodes a valid base64 string to a UUID-like string", () => {
    const base64Input = "AAECAwQFBgcICQoLDA0ODw==";
    const expected = "000102030405460788090a0b0c0d0e0f";
    expect(decodeToUUID(base64Input)).toBe(expected);
  });

  it("handles edge case base64 that might be problematic for byte manipulation", () => {
    const allFsBase64 = "/////////////////////w==";
    const expected = "ffffffffffff4fffbfffffffffffffff";
    expect(decodeToUUID(allFsBase64)).toBe(expected);
  });
});

describe("callServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();

    mockGetTransactionOutcomes.mockResolvedValue({
      right: {
        status: 200,
        value: {
          outcome: 0,
          isFinalStatus: true,
          totalAmount: 100,
          fees: 10,
        },
      },
    });
    getSessionItem.mockReset();
    getUrlParameter.mockReset();
  });

  it("handles *missing URL id* & *no session tx* → sets GENERIC_ERROR, no mixpanel event for steps", async () => {
    getSessionItem.mockReturnValue(undefined);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires STEP-1 mixpanel event when URL id missing but tx present in session", async () => {
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.objectContaining({ TRANSACTION_ID: sessionTx.transactionId })
    );
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.SUCCESS
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("URL id MISSING, session TX PRESENT: stores SUCCESS outcome & amount (using session tx)", async () => {
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.objectContaining({ TRANSACTION_ID: sessionTx.transactionId })
    );
    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        OUTCOME: 0,
      })
    );
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.SUCCESS
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount, 110);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("bearerAuth missing from session: sets GENERIC_ERROR", async () => {
    getSessionItem.mockImplementation((key: string) =>
      key === SessionItems.transaction
        ? { transactionId: "tx-id-session" }
        : undefined
    );
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);
    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.objectContaining({ TRANSACTION_ID: "tx-id-session" })
    );
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).not.toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll returns non-SUCCESS outcome (PSP_ERROR): clears amount", async () => {
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 200,
        value: { outcome: 25, isFinalStatus: true, totalAmount: 200, fees: 20 },
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.PSP_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll fails (network error in TE.tryCatch): sets GENERIC_ERROR", async () => {
    mockGetTransactionOutcomes.mockRejectedValueOnce(new Error("network down"));
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHECKOUT_POLLING_OUTCOME_ERROR",
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        error: "Polling request rejected: network down",
      })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll SUCCESS but totalAmount/fees undefined from API: stores totalAmount as 0", async () => {
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 200,
        value: { outcome: 0, isFinalStatus: true },
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.SUCCESS
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount, 0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("URL id PRESENT and DECODES, session authToken PRESENT: polls and succeeds", async () => {
    const localValidBase64UrlId = "AAECAwQFBgcICQoLDA0ODw==";
    const localExpectedDecodedId = "000102030405460788090a0b0c0d0e0f";

    getUrlParameter.mockReturnValue(localValidBase64UrlId);
    getSessionItem.mockReturnValue(sessionTx);

    await callServices(onComplete);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_RESP_ERR"),
      expect.objectContaining({
        EVENT_ID: expect.stringContaining(
          "THREEDSACSCHALLENGEURL_STEP2_RESP_ERR"
        ),
      })
    );
    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.objectContaining({
        TRANSACTION_ID: localExpectedDecodedId,
        OUTCOME: 0,
      })
    );
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.SUCCESS
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount, 110);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll returns non-200 status which IS ProblemJson: sets GENERIC_ERROR", async () => {
    const problem = {
      type: "problem_type",
      title: "Specific Problem",
      status: 400,
    };
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 400,
        value: problem,
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHECKOUT_POLLING_OUTCOME_ERROR",
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        error: JSON.stringify(problem),
      })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll returns non-200 status which is NOT ProblemJson: sets GENERIC_ERROR", async () => {
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 503,
        value: "Service Unavailable",
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHECKOUT_POLLING_OUTCOME_ERROR",
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        error: "Polling stopped on status 503, not ProblemJson",
      })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll returns 200, but final isFinalStatus is false: sets GENERIC_ERROR", async () => {
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 200,
        value: { outcome: 0, isFinalStatus: false, totalAmount: 100, fees: 10 },
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHECKOUT_POLLING_OUTCOME_ERROR",
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        error: "Polling ended but isFinalStatus=false",
      })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("poll returns 200, final isFinalStatus is true, but TransactionOutcomeInfo.decode fails: sets GENERIC_ERROR", async () => {
    mockGetTransactionOutcomes.mockResolvedValueOnce({
      right: {
        status: 200,
        value: {
          outcome: "not-a-number",
          isFinalStatus: true,
          totalAmount: 100,
          fees: 10,
        },
      },
    });
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestViewOutcomeEnum.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHECKOUT_POLLING_OUTCOME_ERROR",
      expect.objectContaining({
        TRANSACTION_ID: sessionTx.transactionId,
        error: expect.stringContaining("FINAL response decode failed:"),
      })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
