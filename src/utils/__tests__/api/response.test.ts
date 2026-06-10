jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
  exponentialPollingWithPromisePredicateFetch: jest.fn((_) => jest.fn()),
  RetryDecision: {},
}));

jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "test",
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
    CHECKOUT_API_RETRY_DELAY: 200,
    CHECKOUT_API_RETRY_NUMBERS: 3,
    CHECKOUT_API_TIMEOUT: 1000,
  })),
}));

jest.mock("../../storage/sessionStorage");
jest.mock("../../mixpanel/mixpanelHelperInit");
jest.mock("../../transactions/transactionHelper");
jest.mock("../../regex/urlUtilities");

import * as TE from "fp-ts/TaskEither";
import { callServices } from "../../api/response";
import { getSessionItem } from "../../storage/sessionStorage";
import { ecommerceTransactionOutcome } from "../../transactions/transactionHelper";
import { getUrlParameter } from "../../regex/urlUtilities";
import { TransactionOutcomeInfo } from "../../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";

const SOME_TRANSACTION = { transactionId: "test-id", authToken: "test-token" };

const successPayload: TransactionOutcomeInfo = {
  outcome: 0,
  isFinalStatus: true,
  totalAmount: 1000 as any,
  fees: 100 as any,
};

describe("callServices", () => {
  const mockHandleOutcome = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should track STEP1_RESP_ERR when id fragment is empty", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(undefined);
    (getUrlParameter as jest.Mock).mockReturnValue("");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.left(new Error("n/a"))
    );

    await callServices(mockHandleOutcome);

    expect(mockHandleOutcome).toHaveBeenCalledTimes(1);
    expect(mockHandleOutcome).toHaveBeenCalledWith();
  });

  it("should processe a successful outcome and forward data", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.right(successPayload)
    );

    await callServices(mockHandleOutcome);

    expect(mockHandleOutcome).toHaveBeenCalledWith(successPayload);
  });

  it("should track STEP2_RESP_ERR when the outcome call fails", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.left(new Error("failure"))
    );

    await callServices(mockHandleOutcome);
    expect(mockHandleOutcome).toHaveBeenCalledTimes(1);
    expect(mockHandleOutcome).toHaveBeenCalledWith();
  });

  it("should handle malformed payload gracefully", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.right({
        isFinalStatus: true,
        totalAmount: 500 as any,
        fees: 0 as any,
      } as TransactionOutcomeInfo)
    );

    await callServices(mockHandleOutcome);

    expect(mockHandleOutcome).toHaveBeenCalledTimes(1);
  });
});

describe("response.ts polling predicate", () => {
  type PredicateResult = boolean | { retry: boolean; retryAfterMs?: number };

  const mkRes = (status: number, isFinal: boolean) =>
    ({
      status,
      clone() {
        return this;
      },
      json: async () => ({ isFinalStatus: isFinal }),
    } as unknown as Response);

  const mk429Res = (retryAfterHeader: string | null) =>
    ({
      status: 429,
      headers: {
        get: () => retryAfterHeader,
      },
    } as unknown as Response);

  const getFreshPredicate = async () => {
    jest.resetModules();
    await import("../../api/response");
    const {
      exponentialPollingWithPromisePredicateFetch,
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    } = require("../../config/fetch");
    return exponentialPollingWithPromisePredicateFetch.mock.calls[0][4] as (
      r: Response
    ) => Promise<PredicateResult>;
  };

  it("should return false immediately when status===200 and isFinalStatus is true", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(200, true))).resolves.toBe(false);
  });

  it("should retry on 200 when isFinalStatus=false", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(200, false))).resolves.toBe(true);
  });

  it("should retry on 404", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(404, true))).resolves.toBe(true);
  });
  it("should stop on other 4xx errors", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(400, false))).resolves.toBe(false);
    await expect(predicate(mkRes(401, false))).resolves.toBe(false);
    await expect(predicate(mkRes(403, false))).resolves.toBe(false);
    await expect(predicate(mkRes(422, false))).resolves.toBe(false);
  });

  it("should not stop on 5xx errors", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(500, false))).resolves.toBe(true);
    await expect(predicate(mkRes(502, false))).resolves.toBe(true);
    await expect(predicate(mkRes(503, false))).resolves.toBe(true);
  });

  it("should parse Retry-After seconds on 429", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mk429Res("2"))).resolves.toEqual({
      retry: true,
      retryAfterMs: 2000,
    });
  });

  it("should parse Retry-After date on 429", async () => {
    const predicate = await getFreshPredicate();
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1000);
    const retryAfterDate = "Thu, 01 Jan 1970 00:00:04 GMT";

    await expect(predicate(mk429Res(retryAfterDate))).resolves.toEqual({
      retry: true,
      retryAfterMs: 3000,
    });

    nowSpy.mockRestore();
  });

  it("should fallback to configured delay when Retry-After is invalid", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mk429Res("not-a-valid-value"))).resolves.toEqual({
      retry: true,
      retryAfterMs: 200,
    });
  });

  it("should fallback to configured delay when Retry-After is missing", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mk429Res(null))).resolves.toEqual({
      retry: true,
      retryAfterMs: 200,
    });
  });
});
