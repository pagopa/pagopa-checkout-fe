import { getSessionItem } from "../../../../../utils/storage/sessionStorage";
import { ErrorsType } from "../../../../../utils/errors/checkErrorsModel";
import * as E from "fp-ts/Either";
import {
  calculateFeeResponseMock,
  mockApiConfig,
  paymentMethodResponseMock,
  paymentMethodsMock,
  postSessionResponseMock,
  sessionItemTransactionMock,
} from "../../../../../utils/testing/testUtils";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientWithRetry,
  apiPaymentEcommerceClientWithRetryV2,
  apiPaymentEcommerceClientWithRetryV3,
} from "../../../../api/client";
import {
  calculateFees,
  getFees,
  getPaymentInstruments,
  npgSessionsFields,
  retrieveCardData,
} from "../../../../api/helper";

jest.mock("../../../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => mockApiConfig),
}));

jest.mock("../../../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getRptIdsFromSession: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    transaction: "transaction",
  },
}));

jest.mock("../../../../api/client", () => ({
  apiPaymentEcommerceClient: {
    getSessionPaymentMethod: jest.fn(),
    getAllPaymentMethods: jest.fn(),
  },
  apiPaymentEcommerceClientV3: {
    getAllPaymentMethodsV3: jest.fn(),
  },
  apiPaymentEcommerceClientWithRetry: {
    createSession: jest.fn(),
  },
  apiPaymentEcommerceClientWithRetryV2: {
    calculateFees: jest.fn(),
  },
  apiPaymentEcommerceClientWithRetryV3: {
    createSessionV3: jest.fn(),
  },
}));

const mockOnResponse: jest.Mock = jest.fn();
const mockOnError: jest.Mock = jest.fn();
const mockPspNotFound: jest.Mock = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
});

describe("Ecommerce payment methods helper - retrieveCardData tests", () => {
  it("Should call onResponseSessionPaymentMethod when api return correct value", async () => {
    (
      apiPaymentEcommerceClient.getSessionPaymentMethod as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: paymentMethodResponseMock,
        },
      })
    );
    await retrieveCardData({
      paymentId: "paymentId",
      orderId: "orderId",
      onError: mockOnError,
      onResponseSessionPaymentMethod: mockOnResponse,
    });
    expect(mockOnResponse).toHaveBeenCalledWith(paymentMethodResponseMock);
  });

  it("Should call onError with ErrorsType.SERVER when api fail", async () => {
    (
      apiPaymentEcommerceClient.getSessionPaymentMethod as jest.Mock
    ).mockRejectedValue("Api error");
    await retrieveCardData({
      paymentId: "paymentId",
      orderId: "orderId",
      onError: mockOnError,
      onResponseSessionPaymentMethod: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.SERVER);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    (
      apiPaymentEcommerceClient.getSessionPaymentMethod as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await retrieveCardData({
      paymentId: "paymentId",
      orderId: "orderId",
      onError: mockOnError,
      onResponseSessionPaymentMethod: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});

describe("Ecommerce payment methods helper - calculateFees tests", () => {
  it("Should call onResponsePsp when api return correct value", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponseMock,
        },
      })
    );
    await calculateFees({
      paymentId: "paymentId",
      bin: "bin",
      onError: mockOnError,
      onPspNotFound: mockPspNotFound,
      onResponsePsp: mockOnResponse,
    });
    expect(mockOnResponse).toHaveBeenCalledWith(calculateFeeResponseMock);
  });

  it("Should call onError with ErrorsType.SERVER when api fail", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockRejectedValue("Api error");
    await calculateFees({
      paymentId: "paymentId",
      bin: "bin",
      onError: mockOnError,
      onPspNotFound: mockPspNotFound,
      onResponsePsp: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.SERVER);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await calculateFees({
      paymentId: "paymentId",
      bin: "bin",
      onError: mockOnError,
      onPspNotFound: mockPspNotFound,
      onResponsePsp: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onPspNotFound when api return 404", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 404,
        },
      })
    );
    await calculateFees({
      paymentId: "paymentId",
      bin: "bin",
      onError: mockOnError,
      onPspNotFound: mockPspNotFound,
      onResponsePsp: mockOnResponse,
    });
    expect(mockPspNotFound).toHaveBeenCalled();
  });
});

describe("Ecommerce payment methods helper - getPaymentInstruments tests", () => {
  it("Should call onError with GENERIC_ERROR and onResponse with empty array when API returns status 500", async () => {
    // Simula presenza di token in sessione (quindi ramo V3)
    (getSessionItem as jest.Mock).mockReturnValue("fake-auth-token");

    // Simula che getAllPaymentMethodsV3 ritorni un Either.left
    (apiPaymentEcommerceClientV3.getAllPaymentMethodsV3 as jest.Mock).mockReturnValue(
      Promise.resolve(E.left(new Error("some error")))
    );

    await getPaymentInstruments(
      { amount: 100 },
      mockOnError,
      mockOnResponse
    );

    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
    expect(mockOnResponse).toHaveBeenCalledWith([]); // perché ritorna []
  });

  it("Should call onResponse when api return correct value", async () => {
    (
      apiPaymentEcommerceClient.getAllPaymentMethods as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: {
            paymentMethods: paymentMethodsMock,
          },
        },
      })
    );
    await getPaymentInstruments(
      {
        amount: 1,
      },
      mockOnError,
      mockOnResponse
    );
    expect(mockOnResponse).toHaveBeenCalledWith(paymentMethodsMock);
  });

  it("Should call onError with ErrorsType.STATUS_ERROR when api fail", async () => {
    (
      apiPaymentEcommerceClient.getAllPaymentMethods as jest.Mock
    ).mockRejectedValue("Api error");
    await getPaymentInstruments(
      {
        amount: 1,
      },
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.STATUS_ERROR);
  });

  it("Should call onResponse when api return correct value on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getAllPaymentMethodsV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: {
            paymentMethods: paymentMethodsMock,
          },
        },
      })
    );
    await getPaymentInstruments(
      {
        amount: 1,
      },
      mockOnError,
      mockOnResponse
    );
    expect(mockOnResponse).toHaveBeenCalledWith(paymentMethodsMock);
  });

  it("Should call onError with ErrorsType.STATUS_ERROR when api fail on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getAllPaymentMethodsV3 as jest.Mock
    ).mockRejectedValue("Api error");
    await getPaymentInstruments(
      {
        amount: 1,
      },
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.STATUS_ERROR);
  });

  it("Should call onError with ErrorsType.UNAUTHORIZED when api return 401 on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getAllPaymentMethodsV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 401,
        },
      })
    );
    await getPaymentInstruments(
      {
        amount: 1,
      },
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.UNAUTHORIZED);
  });
});

describe("Ecommerce payment methods helper - npgSessionsFields tests", () => {
  it("Should call onResponse when api return correct value", async () => {
    (
      apiPaymentEcommerceClientWithRetry.createSession as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: postSessionResponseMock,
        },
      })
    );
    await npgSessionsFields(mockOnError, mockOnResponse);
    expect(mockOnResponse).toHaveBeenCalledWith(postSessionResponseMock);
  });

  it("Should call onResponse when api return correct value on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientWithRetryV3.createSessionV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: postSessionResponseMock,
        },
      })
    );
    await npgSessionsFields(mockOnError, mockOnResponse);
    expect(mockOnResponse).toHaveBeenCalledWith(postSessionResponseMock);
  });

  it("Should call onError with ErrorsType.UNAUTHORIZED when api return 401 on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientWithRetryV3.createSessionV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 401,
        },
      })
    );
    await npgSessionsFields(mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.UNAUTHORIZED);
  });
});

describe("Ecommerce payment methods helper - getFees tests", () => {
  it("Should call onSuccess when api return correct value", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponseMock,
        },
      })
    );
    await getFees(mockOnResponse, mockPspNotFound, mockOnError, "bin");
    expect(mockOnResponse).toHaveBeenCalledWith(
      calculateFeeResponseMock.belowThreshold
    );
  });

  it("Should call onPspNotFound when api return 404", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 404,
        },
      })
    );
    await getFees(mockOnResponse, mockPspNotFound, mockOnError, "bin");
    expect(mockPspNotFound).toHaveBeenCalled();
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when calculateFee response is invalid", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: {},
        },
      })
    );
    await getFees(mockOnResponse, mockPspNotFound, mockOnError, "bin");
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
  it("SHould call onError with ErrorsType.GENERIC_ERROR when calculateFee returns 401", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(sessionItemTransactionMock);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        left: {
          status: 401,
          value: {},
        },
      })
    );
    await getFees(mockOnResponse, mockPspNotFound, mockOnError, "bin");
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});
