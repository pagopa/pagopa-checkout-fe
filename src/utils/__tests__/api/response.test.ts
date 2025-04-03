jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn((_) => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn((_) => jest.fn()),
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
  })),
}));

import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { callServices } from "../../api/response";
import { getSessionItem } from "../../storage/sessionStorage";
import { mixpanel } from "../../config/mixpanelHelperInit";
import { ecommerceTransaction } from "../../transactions/transactionHelper";
import { getUrlParameter } from "../../regex/urlUtilities";
import { TransactionStatusEnum } from "../../../../generated/definitions/payment-ecommerce/TransactionStatus";

jest.mock("../../storage/sessionStorage");
jest.mock("../../config/mixpanelHelperInit");
jest.mock("../../transactions/transactionHelper");
jest.mock("../../regex/urlUtilities");

describe("callServices", () => {
  const mockHandleFinalStatusResult = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should handle missing transaction id and track mixpanel error event", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(O.none);
    (getUrlParameter as jest.Mock).mockReturnValue("");
    (ecommerceTransaction as jest.Mock).mockReturnValue(
      TE.left(new Error("Invalid transaction ID"))
    );

    await callServices(mockHandleFinalStatusResult);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSMETHODURL_STEP1_RESP_ERR"),
      expect.any(Object)
    );
    expect(mockHandleFinalStatusResult).toBeCalledTimes(1);
  });

  it("should handle a valid transaction and call final status result handler", async () => {
    const mockTransaction = {
      transactionId: "test-id",
      authToken: "test-token",
    };
    (getSessionItem as jest.Mock).mockReturnValue(O.some(mockTransaction));
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransaction as jest.Mock).mockReturnValue(
      TE.right({
        status: TransactionStatusEnum.NOTIFIED_OK,
        nodeInfo: { someData: "node" },
        gatewayInfo: { someData: "gateway" },
      })
    );

    await callServices(mockHandleFinalStatusResult);

    expect(mixpanel.track).toHaveBeenCalledWith(
      expect.stringContaining("THREEDSACSCHALLENGEURL_STEP2_SUCCESS"),
      expect.any(Object)
    );
    expect(mockHandleFinalStatusResult).toHaveBeenCalledWith(
      TransactionStatusEnum.NOTIFIED_OK,
      { someData: "node" },
      { someData: "gateway" }
    );
  });

  it("should handle transaction failure and not call final status result handler", async () => {
    const mockTransaction = {
      transactionId: "test-id",
      authToken: "test-token",
    };
    (getSessionItem as jest.Mock).mockReturnValue(O.some(mockTransaction));
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransaction as jest.Mock).mockReturnValue(
      TE.left(new Error("Transaction failed"))
    );

    await callServices(mockHandleFinalStatusResult);

    expect(mockHandleFinalStatusResult).toBeCalledTimes(1);
  });

  it("should handle transaction with missing authorization status", async () => {
    const mockTransaction = {
      transactionId: "test-id",
      authToken: "test-token",
    };
    (getSessionItem as jest.Mock).mockReturnValue(O.some(mockTransaction));
    (getUrlParameter as jest.Mock).mockReturnValue("encoded-id");
    (ecommerceTransaction as jest.Mock).mockReturnValue(
      TE.right({
        status: TransactionStatusEnum.NOTIFIED_OK,
        nodeInfo: { someData: "node" },
        gatewayInfo: { authorizationStatus: undefined },
      })
    );

    await callServices(mockHandleFinalStatusResult);

    expect(mockHandleFinalStatusResult).toBeCalledTimes(1);
  });
});
