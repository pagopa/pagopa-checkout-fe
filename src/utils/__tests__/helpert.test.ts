/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-underscore-dangle */
/* eslint-disable functional/immutable-data */
// eslint-disable-next-line functional/immutable-data
(global as any)._env_ = {
  CHECKOUT_PAGOPA_APIM_HOST: "http://localhost:1234",
  CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH: "/checkout/payments/v1",
  CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH:
    "/checkout/payment-transactions/v1",
  CHECKOUT_PM_HOST: "http://localhost:8080",
  CHECKOUT_PM_API_BASEPATH: "/pp-restapi/v4",
  CHECKOUT_API_TIMEOUT: 10000,
  CHECKOUT_POLLING_ACTIVATION_INTERVAL: 1000,
  CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: 3,
  CHECKOUT_ENV: "develop",
  CHECKOUT_RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  CHECKOUT_DONATIONS_URL:
    "https://api.uat.platform.pagopa.it/donations/api/v1/availabledonations",
  CHECKOUT_API_ECOMMERCE_BASEPATH: "/ecommerce/checkout/v1",
  CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/ecommerce/checkout/v2",
  CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/checkout/feature-flags/v1",
  CHECKOUT_PAGOPA_ASSETS_CDN:
    "https://assets.cdn.platform.pagopa.it/payment-methods",
  CHECKOUT_PAGOPA_LOGOS_CDN: "https://assets.cdn.io.italia.it/logos/abi",
  CHECKOUT_SURVEY_SHOW: 0,
  CHECKOUT_GDI_CHECK_TIMEOUT: 12000,
  CHECKOUT_NPG_SDK_URL:
    "https://stg-ta.nexigroup.com/monetaweb/resources/hfsdk.js",
  CHECKOUT_API_RETRY_NUMBERS: 2,
  CHECKOUT_API_RETRY_DELAY: 200,
  CHECKOUT_AUTH_SERVICE_HOST: "http://localhost:1234",
  CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/checkout/auth-service/v1",
};

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { ErrorsType } from "../errors/checkErrorsModel";
import { apiCheckoutAuthServiceClientV1 } from "../api/client";
import { authentication } from "../api/helper";
import { mockFetch } from "./mock-fetch";

describe("authentication", () => {
  const mockAuthToken = "mockAuthToken";
  const mockAuthCode = "mockAuthCode";
  const mockState = "mockState";

  const mockOnResponse = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    window.fetch = mockFetch({});
  });

  it("should call onResponse with authToken on successful authentication", async () => {
    (
      apiCheckoutAuthServiceClientV1.authenticateWithAuthToken as jest.Mock
    ).mockReturnValue(
      TE.right(
        E.right({
          status: 200,
          value: { authToken: mockAuthToken },
        })
      )()
    );

    await authentication({
      authCode: mockAuthCode,
      state: mockState,
      onResponse: mockOnResponse,
      onError: mockOnError,
    });

    expect(mockOnResponse).toHaveBeenCalledWith(mockAuthToken);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should call onError with GENERIC_ERROR on decode failure", async () => {
    global.fetch = mockFetch({});
    window.fetch = mockFetch({});
    await authentication({
      authCode: null,
      state: mockState,
      onResponse: mockOnResponse,
      onError: mockOnError,
    });

    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
    expect(mockOnResponse).not.toHaveBeenCalled();
  });

  it("should call onError with GENERIC_ERROR on API failure", async () => {
    (
      apiCheckoutAuthServiceClientV1.authenticateWithAuthToken as jest.Mock
    ).mockReturnValue(TE.left(ErrorsType.GENERIC_ERROR)());

    await authentication({
      authCode: mockAuthCode,
      state: mockState,
      onResponse: mockOnResponse,
      onError: mockOnError,
    });

    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
    expect(mockOnResponse).not.toHaveBeenCalled();
  });

  it("should call onError with CONNECTION on non-200 response status", async () => {
    (
      apiCheckoutAuthServiceClientV1.authenticateWithAuthToken as jest.Mock
    ).mockReturnValue(
      TE.right(
        E.right({
          status: 500,
          value: {},
        })
      )()
    );

    await authentication({
      authCode: mockAuthCode,
      state: mockState,
      onResponse: mockOnResponse,
      onError: mockOnError,
    });

    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION);
    expect(mockOnResponse).not.toHaveBeenCalled();
  });
});
