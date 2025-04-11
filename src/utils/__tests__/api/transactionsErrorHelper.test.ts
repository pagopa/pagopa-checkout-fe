import { onErrorActivate } from "../../api/transactionsErrorHelper";
import { CheckoutRoutes } from "../../../routes/models/routeModel";

// Mock the NavigateFunction from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual<Record<string, unknown>>("react-router-dom"),
  NavigateFunction: jest.fn(),
}));

describe("onErrorActivate", () => {
  /* eslint-disable functional/no-let */
  let mockNavigate: jest.Mock;
  /* eslint-disable functional/no-let */
  let mockOnError: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn(); // Mock the navigate function
    mockOnError = jest.fn(); // Mock the onError callback
  });

  it("should navigate to AUTH_EXPIRED route when session is expired and unauthorized", () => {
    const faultCodeCategory = "SESSION_EXPIRED";
    const faultCodeDetail = "Unauthorized";

    onErrorActivate(
      faultCodeCategory,
      faultCodeDetail,
      mockOnError,
      mockNavigate
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.AUTH_EXPIRED}`
    );
  });

  it("should navigate to SESSIONE_SCADUTA route when faultCodeDetail is in POST_TRANSACTION_ERROR_EXPIRED", () => {
    const faultCodeCategory = "SOME_CATEGORY";
    const faultCodeDetail = "PPT_WISP_SESSIONE_SCONOSCIUTA";

    onErrorActivate(
      faultCodeCategory,
      faultCodeDetail,
      mockOnError,
      mockNavigate
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.SESSIONE_SCADUTA}`
    );
  });

  it("should call onError with the correct message when faultCodeDetail is not matched", () => {
    const faultCodeCategory = "SOME_CATEGORY";
    const faultCodeDetail = "SOME_OTHER_ERROR";

    onErrorActivate(
      faultCodeCategory,
      faultCodeDetail,
      mockOnError,
      mockNavigate
    );

    expect(mockOnError).toHaveBeenCalledWith("SOME_CATEGORY-SOME_OTHER_ERROR");
  });

  it("should call onError with the correct message when faultCodeDetail is undefined", () => {
    const faultCodeCategory = "SOME_CATEGORY";
    const faultCodeDetail = undefined;

    onErrorActivate(
      faultCodeCategory,
      faultCodeDetail,
      mockOnError,
      mockNavigate
    );

    expect(mockOnError).toHaveBeenCalledWith("SOME_CATEGORY-undefined");
  });
});
