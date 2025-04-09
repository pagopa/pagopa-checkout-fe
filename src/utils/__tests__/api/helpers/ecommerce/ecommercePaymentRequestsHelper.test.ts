import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { RptId } from "../../../../../../generated/definitions/payment-ecommerce-v3/RptId";
import {
  getCartResponseMock,
  getPaymentRequestInfoResponseMock,
  mockApiConfig,
} from "../../../../../utils/testUtils";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV3,
} from "../../../../api/client";
import { getCarts, getEcommercePaymentInfoTask } from "../../../../api/helper";
import { ErrorsType } from "../../../../errors/checkErrorsModel";
import { getSessionItem } from "../../../../storage/sessionStorage";

jest.mock("../../../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => mockApiConfig),
}));

jest.mock("../../../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  SessionItems: {
    authToken: "authToken",
  },
}));

jest.mock("../../../../api/client", () => ({
  apiPaymentEcommerceClient: {
    GetCarts: jest.fn(),
    getPaymentRequestInfo: jest.fn(),
  },
  apiPaymentEcommerceClientV3: {
    getPaymentRequestInfoV3: jest.fn(),
  },
}));

const mockOnResponse: jest.Mock = jest.fn();
const mockOnError: jest.Mock = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
});

describe("Ecommerce payment requests helper - getEcommercePaymentInfoTask tests", () => {
  it("Should return paymentInfo when api return correct value", async () => {
    (
      apiPaymentEcommerceClient.getPaymentRequestInfo as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: getPaymentRequestInfoResponseMock,
        },
      })
    );
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(E.right(getPaymentRequestInfoResponseMock));
  });

  it("Should return error when api fail", async () => {
    (
      apiPaymentEcommerceClient.getPaymentRequestInfo as jest.Mock
    ).mockRejectedValue("Api error");
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(
      E.left({
        faultCodeCategory: ErrorsType.GENERIC_ERROR,
      })
    );
  });

  it("Should return ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    (
      apiPaymentEcommerceClient.getPaymentRequestInfo as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
          value: {
            title: "Error title",
          },
        },
      })
    );
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(
      E.left({
        faultCodeCategory: ErrorsType.GENERIC_ERROR,
        faultCodeDetail: "Unknown error",
      })
    );
  });

  it("Should return paymentInfo when api return correct value on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getPaymentRequestInfoV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: getPaymentRequestInfoResponseMock,
        },
      })
    );
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(E.right(getPaymentRequestInfoResponseMock));
  });

  it("Should return error when api fail on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getPaymentRequestInfoV3 as jest.Mock
    ).mockRejectedValue("Api error");
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(
      E.left({
        faultCodeCategory: ErrorsType.GENERIC_ERROR,
      })
    );
  });

  it("Should return ErrorsType.GENERIC_ERROR when api return 5xx on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getPaymentRequestInfoV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
          value: {
            title: "Error title",
          },
        },
      })
    );
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(
      E.left({
        faultCodeCategory: ErrorsType.GENERIC_ERROR,
        faultCodeDetail: "Unknown error",
      })
    );
  });

  it("Should return SESSION_EXPIRED when api return 401 on v3 api", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiPaymentEcommerceClientV3.getPaymentRequestInfoV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 401,
          value: {
            title: "Error title",
          },
        },
      })
    );
    const result = await pipe(
      getEcommercePaymentInfoTask(
        "77777777777302011511243515601" as RptId,
        "recaptchaToken"
      )
    )();
    expect(result).toEqual(
      E.left({
        faultCodeCategory: "SESSION_EXPIRED",
        faultCodeDetail: "Unauthorized",
      })
    );
  });
});

describe("Ecommerce payment requests helper - getCarts tests", () => {
  it("Should call onResponse when api return correct value", async () => {
    (apiPaymentEcommerceClient.GetCarts as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: getCartResponseMock,
        },
      })
    );
    await getCarts("cartId", mockOnError, mockOnResponse);
    expect(mockOnResponse).toHaveBeenCalledWith(getCartResponseMock);
  });

  it("Should call onError with ErrorsType.STATUS_ERROR when api fail", async () => {
    (apiPaymentEcommerceClient.GetCarts as jest.Mock).mockRejectedValue(
      "Api error"
    );
    await getCarts("cartId", mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.STATUS_ERROR);
  });

  it("Should call onError with ErrorsType.STATUS_ERROR when api return 5xx", async () => {
    (apiPaymentEcommerceClient.GetCarts as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await getCarts("cartId", mockOnError, mockOnResponse);
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.STATUS_ERROR);
  });
});
