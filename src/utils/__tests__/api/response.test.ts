jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
}));

jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "test",
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
  })),
}));

jest.mock("../../storage/sessionStorage");
jest.mock("../../config/mixpanelHelperInit");
jest.mock("../../transactions/transactionHelper");
jest.mock("../../regex/urlUtilities");

import * as TE from "fp-ts/TaskEither";
import { callServices } from "../../api/response";
import { getSessionItem } from "../../storage/sessionStorage";
import { mixpanel } from "../../config/mixpanelHelperInit";
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

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.any(Object)
    );
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

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
    expect(mockHandleOutcome).toHaveBeenCalledWith(successPayload);
  });

  it("should track STEP2_RESP_ERR when the outcome call fails", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.left(new Error("failure"))
    );

    await callServices(mockHandleOutcome);

    expect(mixpanel.track).toHaveBeenCalledTimes(1);
    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_RESP_ERR"),
      expect.any(Object)
    );
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
  const mkRes = (status: number, isFinal: boolean) =>
    ({
      status,
      clone() {
        return this;
      },
      json: async () => ({ isFinalStatus: isFinal }),
    } as unknown as Response);

  const getFreshPredicate = async () => {
    jest.resetModules();
    await import("../../api/response");
    const {
      constantPollingWithPromisePredicateFetch,
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    } = require("../../config/fetch");
    return constantPollingWithPromisePredicateFetch.mock.calls[0][4] as (
      r: Response
    ) => Promise<boolean>;
  };

  it("should return false immediately when status===200 and isFinalStatus is true", async () => {
    const predicate = await getFreshPredicate();
    await expect(predicate(mkRes(200, true))).resolves.toBe(false);
  });
});
