/* eslint-disable sonarjs/no-identical-functions */
import { waitFor } from "@testing-library/react";
import ReCAPTCHA from "react-google-recaptcha";
import { Cart } from "features/payment/models/paymentModel";
import {
  cardPaymentMethodMock,
  getCartResponseMock,
  mockApiConfig,
  sessionItemNoticeInfoMock,
  sessionItemPaymentInfoMock,
  sessionItemTransactionMock,
  transactionResponseMock,
} from "../../../../../utils/testing/testUtils";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV2,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientWithRetry,
} from "../../../../api/client";
import {
  activatePayment,
  cancelPayment,
  proceedToPayment,
  recaptchaTransaction,
} from "../../../../api/helper";
import { ErrorsType } from "../../../../errors/checkErrorsModel";
import {
  getRptIdsFromSession,
  getSessionItem,
} from "../../../../storage/sessionStorage";
import { NewTransactionResponse } from "../../../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";

jest.mock("../../../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => mockApiConfig),
}));

jest.mock("../../../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getRptIdsFromSession: jest.fn(),
  SessionItems: {
    authToken: "authToken",
  },
}));

jest.mock("../../../../api/client", () => ({
  apiPaymentEcommerceClient: {
    requestTransactionUserCancellation: jest.fn(),
  },
  apiPaymentEcommerceClientV2: {
    newTransaction: jest.fn(),
  },
  apiPaymentEcommerceClientV3: {
    newTransactionV3: jest.fn(),
  },
  apiPaymentEcommerceClientWithRetry: {
    requestTransactionAuthorization: jest.fn(),
  },
}));

jest.mock("../../../../api/helpers/recaptchaHelper", () => ({
  callRecaptcha: jest.fn(() => "recaptchaToken"),
}));

// Mock getSessionItem sequentially
const mockSetSessionForActivatePayment = (
  isAuth: boolean,
  cartInfo: Cart | undefined = undefined
) => {
  (getSessionItem as jest.Mock)
    .mockReturnValueOnce(sessionItemNoticeInfoMock)
    .mockReturnValueOnce(sessionItemPaymentInfoMock)
    .mockReturnValueOnce("email")
    .mockReturnValueOnce(cartInfo)
    .mockReturnValueOnce(cardPaymentMethodMock)
    .mockReturnValueOnce("orderId")
    .mockReturnValueOnce("correlationId")
    .mockReturnValueOnce("CHECKOUT")
    .mockReturnValueOnce(isAuth ? "authToken" : undefined)
    .mockReturnValueOnce(cartInfo)
    .mockReturnValueOnce(sessionItemPaymentInfoMock);
};

const mockOnResponse: jest.Mock = jest.fn();
const mockOnError: jest.Mock = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
});

describe("Ecommerce transactions helper - activatePayment tests", () => {
  it("Should call onResponseActivate when api return correct value", async () => {
    mockSetSessionForActivatePayment(false);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transactionResponseMock,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnResponse).toHaveBeenCalledWith(
        cardPaymentMethodMock.paymentMethodId,
        "orderId"
      );
    });
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail", async () => {
    mockSetSessionForActivatePayment(false);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockRejectedValue(
      "Api error"
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        ErrorsType.GENERIC_ERROR,
        undefined
      );
    });
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    mockSetSessionForActivatePayment(false);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        ErrorsType.GENERIC_ERROR,
        "Unknown error"
      );
    });
  });

  it("Should call onResponseActivate when api return correct value on v3 api", async () => {
    mockSetSessionForActivatePayment(true);
    (getRptIdsFromSession as jest.Mock).mockReturnValueOnce("rptIds");
    (apiPaymentEcommerceClientV3.newTransactionV3 as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transactionResponseMock,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnResponse).toHaveBeenCalledWith(
        cardPaymentMethodMock.paymentMethodId,
        "orderId"
      );
      expect(apiPaymentEcommerceClientV3.newTransactionV3).toHaveBeenCalledWith(
        {
          "x-rpt-ids": "rptIds",
          bearerAuth: "authToken", // Check that the token was passed correctly
          body: expect.anything(),
          "x-client-id-from-client": "CHECKOUT",
          "x-correlation-id": "correlationId",
        }
      );
    });
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail on v3 api", async () => {
    mockSetSessionForActivatePayment(true);
    (
      apiPaymentEcommerceClientV3.newTransactionV3 as jest.Mock
    ).mockRejectedValue("Api error");
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        ErrorsType.GENERIC_ERROR,
        undefined
      );
    });
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx on v3 api", async () => {
    mockSetSessionForActivatePayment(true);
    (apiPaymentEcommerceClientV3.newTransactionV3 as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        ErrorsType.GENERIC_ERROR,
        "Unknown error"
      );
    });
  });

  it("Should call onError with ErrorsType.UNAUTHORIZED when api return 401 on v3 api", async () => {
    mockSetSessionForActivatePayment(true);
    (apiPaymentEcommerceClientV3.newTransactionV3 as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 401,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "SESSION_EXPIRED",
        "Unauthorized"
      );
    });
  });

  it("Should call onResponseActivate when api return correct value on cart", async () => {
    mockSetSessionForActivatePayment(false, getCartResponseMock);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transactionResponseMock,
        },
      })
    );
    await activatePayment({
      token: "token",
      onResponseActivate: mockOnResponse,
      onErrorActivate: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnResponse).toHaveBeenCalledWith(
        cardPaymentMethodMock.paymentMethodId,
        "orderId"
      );
    });
  });
});

describe("Ecommerce transactions helper - recaptchaTransaction tests", () => {
  it("Should call onSuccess when api return correct value", async () => {
    mockSetSessionForActivatePayment(false);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transactionResponseMock,
        },
      })
    );
    await recaptchaTransaction({
      recaptchaRef: {} as ReCAPTCHA,
      onSuccess: mockOnResponse,
      onError: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnResponse).toHaveBeenCalledWith(
        cardPaymentMethodMock.paymentMethodId,
        "orderId"
      );
    });
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when activate payment fail", async () => {
    mockSetSessionForActivatePayment(false);
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockRejectedValue(
      "Api error"
    );
    await recaptchaTransaction({
      recaptchaRef: {} as ReCAPTCHA,
      onSuccess: mockOnResponse,
      onError: mockOnError,
    });
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        ErrorsType.GENERIC_ERROR,
        undefined
      );
    });
  });
});

describe("Ecommerce transactions helper - proceedToPayment tests", () => {
  it("Should call onResponse when api return correct value", async () => {
    const authUrl = "authorizationUrl";
    (getSessionItem as jest.Mock).mockReturnValueOnce(cardPaymentMethodMock);
    (
      apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: {
            authorizationUrl: authUrl,
          },
        },
      })
    );
    await proceedToPayment(
      sessionItemTransactionMock as NewTransactionResponse,
      mockOnError,
      mockOnResponse
    );
    expect(mockOnResponse).toHaveBeenCalledWith(authUrl);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail", async () => {
    (getSessionItem as jest.Mock).mockReturnValueOnce(cardPaymentMethodMock);
    (
      apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization as jest.Mock
    ).mockRejectedValue("Api error");
    await proceedToPayment(
      sessionItemTransactionMock as NewTransactionResponse,
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.CONNECTION when api return 5xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValueOnce(cardPaymentMethodMock);
    (
      apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await proceedToPayment(
      sessionItemTransactionMock as NewTransactionResponse,
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION);
  });
});

describe("Ecommerce transactions helper - cancelPayment tests", () => {
  it("Should call onResponse when api return correct value", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClient.requestTransactionUserCancellation as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 202,
          value: {},
        },
      })
    );
    await cancelPayment(mockOnError, mockOnResponse);
    expect(mockOnResponse).toHaveBeenCalled();
  });

  it("Should call onError with ErrorsType.CONNECTION when api fail", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClient.requestTransactionUserCancellation as jest.Mock
    ).mockRejectedValue("Api error");
    await cancelPayment(mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION, false);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 4xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClient.requestTransactionUserCancellation as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 400,
        },
      })
    );
    await cancelPayment(mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR, true);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClient.requestTransactionUserCancellation as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await cancelPayment(mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR, false);
  });

  it("Should call onResponse when paymentMethod has walletId", async () => {
    const authUrl = "authorizationUrl";

    // Mock paymentMethod con walletId
    const walletPaymentMethodMock = {
      walletId: "WALLET_ID",
      paymentMethodId: "PAYMENT_METHOD_ID",
      walletType: "PAYPAL",
    };

    (getSessionItem as jest.Mock).mockReturnValueOnce(walletPaymentMethodMock);

    (
      apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization as jest.Mock
    ).mockResolvedValue({
      right: {
        status: 200,
        value: { authorizationUrl: authUrl },
      },
    });

    await proceedToPayment(
      sessionItemTransactionMock as NewTransactionResponse,
      mockOnError,
      mockOnResponse
    );

    expect(mockOnResponse).toHaveBeenCalledWith(authUrl);

    const bodySent = (
      apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization as jest.Mock
    ).mock.calls[0][0].body;

    expect(bodySent.details.detailType).toBe("wallet");
    expect(bodySent.details.walletId).toBe("WALLET_ID");
  });
});
