/* eslint-disable functional/immutable-data */
/* @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */

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

jest.mock("../../config/fetch", () => {
  const makeResp = (status: number, body: any) =>
    ({
      status,
      clone: () => ({
        json: () =>
          status === 299
            ? Promise.reject(new Error("bad json"))
            : Promise.resolve(body),
      }),
    } as unknown as Response);

  const constantPollingWithPromisePredicateFetch = jest.fn(
    (
      _promise: any,
      _retries: number,
      _delay: number,
      _timeout: number,
      predicate: (r: Response) => Promise<boolean>
    ) => {
      predicate(makeResp(500, {}));
      predicate(makeResp(500, {}));
      predicate(
        makeResp(200, { outcome: 0, isFinalStatus: false, totalAmount: 1 })
      );
      predicate(
        makeResp(200, { outcome: 0, isFinalStatus: true, totalAmount: 1 })
      );
      predicate(makeResp(200, { foo: "bar" }));
      predicate(makeResp(299, {}));

      return jest.fn();
    }
  );

  return {
    constantPollingWithPromisePredicateFetch,
    retryingFetch: jest.fn(() => jest.fn()),
  };
});

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
  getSessionItem as _getSessionItem,
  setSessionItem as _setSessionItem,
  clearSessionItem as _clearSessionItem,
  SessionItems,
} from "../../storage/sessionStorage";
import { getUrlParameter as _getUrlParameter } from "../../regex/urlUtilities";
import { mixpanel as _mixpanel } from "../../config/mixpanelHelperInit";

const getSessionItem = _getSessionItem as jest.Mock;
const setSessionItem = _setSessionItem as jest.Mock;
const clearSessionItem = _clearSessionItem as jest.Mock;
const getUrlParameter = _getUrlParameter as jest.Mock;
const mixpanel = { track: _mixpanel.track as jest.Mock };

const onComplete = jest.fn();
const sessionTx = { transactionId: "tx-id-session", authToken: "tok-session" };

const TestOutcome = {
  SUCCESS: "0",
  GENERIC_ERROR: "1",
  PSP_ERROR: "25",
};

describe("decodeToUUID", () => {
  it("decodes normal base64", () => {
    expect(decodeToUUID("AAECAwQFBgcICQoLDA0ODw==")).toBe(
      "000102030405460788090a0b0c0d0e0f"
    );
  });

  it("decodes corner-case (all 0xFF)", () => {
    expect(decodeToUUID("/////////////////////w==")).toBe(
      "ffffffffffff4fffbfffffffffffffff"
    );
  });
});

describe("callServices - happy & error paths", () => {
  beforeEach(() => {
    jest.clearAllMocks();

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
  });

  it("no URL id + no session tx ⇒ GENERIC_ERROR, no mixpanel", async () => {
    getSessionItem.mockReturnValue(undefined);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestOutcome.GENERIC_ERROR
    );
    expect(mixpanel.track).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires STEP-1 event when URL id missing but tx present", async () => {
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.objectContaining({ TRANSACTION_ID: sessionTx.transactionId })
    );
  });

  it("stores SUCCESS outcome + amount when polling succeeds", async () => {
    getSessionItem.mockReturnValue(sessionTx);
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestOutcome.SUCCESS
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount, 110);
    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
  });

  it("sets GENERIC_ERROR when bearerAuth missing even if txId present", async () => {
    getSessionItem.mockImplementation((k: string) =>
      k === SessionItems.transaction
        ? { transactionId: "only-id-no-token" }
        : undefined
    );
    getUrlParameter.mockReturnValue(null);

    await callServices(onComplete);

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.outcome,
      TestOutcome.GENERIC_ERROR
    );
    expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    expect(mixpanel.track).not.toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
  });
});
