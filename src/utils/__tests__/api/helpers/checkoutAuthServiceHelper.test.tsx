import ReCAPTCHA from "react-google-recaptcha";
import { mockApiConfig } from "../../../../utils/testing/testUtils";
import {
  apiCheckoutAuthServiceClientAuthTokenV1,
  apiCheckoutAuthServiceClientV1,
  apiCheckoutAuthServiceWithRetryV1,
} from "../../../api/client";
import {
  proceedToLogin,
  authentication,
  checkLogout,
  logoutUser,
  retrieveUserInfo,
} from "../../../api/helper";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import { callRecaptcha } from "../../../../utils/api/helpers/recaptchaHelper";
import { getSessionItem } from "../../../../utils/storage/sessionStorage";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
} from "../../../mixpanel/mixpanelEvents";
import { mixpanel } from "../../../mixpanel/mixpanelHelperInit";

jest.mock("../../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  getRptIdsFromSession: jest.fn(),
  SessionItems: {
    authToken: "authToken",
  },
}));

jest.mock("../../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => mockApiConfig),
}));

jest.mock("../../../api/client", () => ({
  apiCheckoutAuthServiceClientV1: {
    authLogin: jest.fn(),
  },
  apiCheckoutAuthServiceClientAuthTokenV1: {
    authenticateWithAuthToken: jest.fn(),
  },
  apiCheckoutAuthServiceWithRetryV1: {
    authUsers: jest.fn(),
    authLogout: jest.fn(),
  },
}));

jest.mock("../../../api/helpers/recaptchaHelper", () => ({
  callRecaptcha: jest.fn(() => "recaptchaToken"),
}));

jest.mock("../../../mixpanel/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

const mockOnResponse: jest.Mock = jest.fn();
const mockOnError: jest.Mock = jest.fn();
const onLogoutCallBack: jest.Mock = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
});

describe("Checkout auth service helper - proceedToLogin tests", () => {
  it("Should call onResponse when api return correct value", async () => {
    const urlRedirect = "http://redirect-url";
    (apiCheckoutAuthServiceClientV1.authLogin as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: { urlRedirect },
        },
      })
    );
    await proceedToLogin({
      recaptchaRef: {} as ReCAPTCHA,
      onError: mockOnError,
      onResponse: mockOnResponse,
    });
    expect(mockOnResponse).toHaveBeenCalledWith(urlRedirect);
  });

  it("Should call onError with ErrorsType.SERVER when api fail", async () => {
    (apiCheckoutAuthServiceClientV1.authLogin as jest.Mock).mockRejectedValue(
      "Api error"
    );
    await proceedToLogin({
      recaptchaRef: {} as ReCAPTCHA,
      onError: mockOnError,
      onResponse: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.SERVER);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api return 5xx", async () => {
    (apiCheckoutAuthServiceClientV1.authLogin as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await proceedToLogin({
      recaptchaRef: {} as ReCAPTCHA,
      onError: mockOnError,
      onResponse: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when recaptcha fail", async () => {
    (callRecaptcha as jest.Mock).mockReturnValue(Promise.resolve(null));
    await proceedToLogin({
      recaptchaRef: {} as ReCAPTCHA,
      onError: mockOnError,
      onResponse: mockOnResponse,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});

describe("Checkout auth service helper - authentication tests", () => {
  it("Should call onResponse with the authToken value", async () => {
    const authToken = "auth-token";
    (
      apiCheckoutAuthServiceClientAuthTokenV1.authenticateWithAuthToken as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: { authToken },
        },
      })
    );
    await authentication({
      authCode: "code",
      state: "state",
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnResponse).toHaveBeenCalledWith(authToken);
    expect(mixpanel.track).toHaveBeenCalledWith(
      MixpanelEventsId.CHK_LOGIN_SUCCESS,
      {
        EVENT_ID: MixpanelEventsId.CHK_LOGIN_SUCCESS,
        EVENT_CATEGORY: MixpanelEventCategory.TECH,
        page: window.location.pathname,
      }
    );
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail", async () => {
    (
      apiCheckoutAuthServiceClientAuthTokenV1.authenticateWithAuthToken as jest.Mock
    ).mockRejectedValue("Api error");
    await authentication({
      authCode: "code",
      state: "state",
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.CONNECTION when api return 5xx", async () => {
    (
      apiCheckoutAuthServiceClientAuthTokenV1.authenticateWithAuthToken as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await authentication({
      authCode: "code",
      state: "state",
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when authCode missing", async () => {
    await authentication({
      authCode: null,
      state: "state",
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when state missing", async () => {
    await authentication({
      authCode: "authCode",
      state: null,
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});

describe("Checkout auth service helper - checkLogout tests", () => {
  it("Should call onLogoutCallBack on logoutUser success", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (apiCheckoutAuthServiceWithRetryV1.authLogout as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 204,
          value: {},
        },
      })
    );
    await checkLogout(onLogoutCallBack);
    expect(onLogoutCallBack).toHaveBeenCalled();
  });

  it("Should call onLogoutCallBack on logoutUser error", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiCheckoutAuthServiceWithRetryV1.authLogout as jest.Mock
    ).mockRejectedValue("Api error");
    await checkLogout(onLogoutCallBack);
    expect(onLogoutCallBack).toHaveBeenCalled();
  });

  it("Should not call onLogoutCallBack when authToken is not present", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(undefined);
    await checkLogout(onLogoutCallBack);
    expect(onLogoutCallBack).toHaveBeenCalledTimes(0);
  });
});

describe("Checkout auth service helper - logoutUser tests", () => {
  it("Should call onResponse when logout is completed", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (apiCheckoutAuthServiceWithRetryV1.authLogout as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 204,
          value: {},
        },
      })
    );
    await logoutUser({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnResponse).toHaveBeenCalled();
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiCheckoutAuthServiceWithRetryV1.authLogout as jest.Mock
    ).mockRejectedValue("Api error");
    await logoutUser({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.CONNECTION when api return 5xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (apiCheckoutAuthServiceWithRetryV1.authLogout as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await logoutUser({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when authToken on session is missing", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);
    await logoutUser({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});

describe("Checkout auth service helper - retrieveUserInfo tests", () => {
  it("Should call onResponse when authUsers is completed", async () => {
    const userInfo = {
      name: "NomeTest",
      familyName: "CognomeTest",
    };
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (apiCheckoutAuthServiceWithRetryV1.authUsers as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: userInfo,
        },
      })
    );
    await retrieveUserInfo({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnResponse).toHaveBeenCalledWith(userInfo);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when api fail", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (
      apiCheckoutAuthServiceWithRetryV1.authUsers as jest.Mock
    ).mockRejectedValue("Api error");
    await retrieveUserInfo({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });

  it("Should call onError with ErrorsType.CONNECTION when api return 5xx", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("authToken");
    (apiCheckoutAuthServiceWithRetryV1.authUsers as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 500,
        },
      })
    );
    await retrieveUserInfo({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.CONNECTION);
  });

  it("Should call onError with ErrorsType.GENERIC_ERROR when authToken on session is missing", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);
    await retrieveUserInfo({
      onResponse: mockOnResponse,
      onError: mockOnError,
    });
    expect(mockOnError).toHaveBeenCalledWith(ErrorsType.GENERIC_ERROR);
  });
});
