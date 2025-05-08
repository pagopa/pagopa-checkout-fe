jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
}));

jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "test",
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/v2",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/v3",
    CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/feature-flags",
    CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/auth-service",
    CHECKOUT_API_TIMEOUT: 5000,
    CHECKOUT_API_RETRY_NUMBERS: 3,
    CHECKOUT_API_RETRY_DELAY: 250,
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
import { TransactionStatusEnum } from "../../../../generated/definitions/payment-ecommerce/TransactionStatus";

const SOME_TRANSACTION = {
  transactionId: "test-id",
  authToken: "test-token",
};

describe("callServices", () => {
  const mockHandleOutcome = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should handle missing transaction id and track mixpanel error", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(undefined);
    (getUrlParameter as jest.Mock).mockReturnValue("");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.left(new Error("Invalid transaction ID"))
    );

    await callServices(mockHandleOutcome);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.any(Object)
    );
    expect(mockHandleOutcome).toHaveBeenCalledTimes(1);
    expect(mockHandleOutcome).toHaveBeenCalledWith();
  });

  it("should process a successful transaction and forward data", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.right({
        status: TransactionStatusEnum.NOTIFIED_OK,
        isFinalStatus: true,
        totalAmount: 1_000,
        fees: 100,
        nodeInfo: { someData: "node" },
        gatewayInfo: { someData: "gateway" },
      })
    );

    await callServices(mockHandleOutcome);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
    expect(mockHandleOutcome).toHaveBeenCalledWith({
      status: TransactionStatusEnum.NOTIFIED_OK,
      isFinalStatus: true,
      totalAmount: 1_000,
      fees: 100,
      nodeInfo: { someData: "node" },
      gatewayInfo: { someData: "gateway" },
    });
  });

  it("should handle a transaction failure and still call outcome once", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.left(new Error("Transaction failed"))
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

  it("should handle malformed success payload gracefully", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(SOME_TRANSACTION);
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransactionOutcome as jest.Mock).mockReturnValue(
      TE.right({
        isFinalStatus: true,
        totalAmount: 500,
        fees: 0,
      })
    );

    await callServices(mockHandleOutcome);

    expect(mockHandleOutcome).toHaveBeenCalledTimes(1);
  });
});
