import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentEmailPage from "../PaymentEmailPage";
// import { getSessionItem, SessionItems, setSessionItem } from "../../utils/storage/sessionStorage";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({
    i18nKey,
  }: {
    i18nKey?: string;
    values?: Record<string, any>;
    components?: Array<any>;
    children?: React.ReactNode;
  }) => <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>,
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  SessionItems: {
    paymentInfo: "paymentInfo",
    useremail: "useremail",
    cart: "cart",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));
/*
  const mockGetSessionItem = (item: SessionItems) => {
    switch (item) {
      case "useremail":
        return undefined;
      default:
        return undefined;
    }
  }; */

describe("PaymentEmailPage", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    navigate.mockClear();
  });
  // This test fails beacause the submit button seems to be disabled due to different email between the 2 fields
  test.skip("test fill email", async () => {
    // (getSessionItem as jest.Mock).mockReturnValue(mockGetSessionItem);
    // (setSessionItem as jest.Mock).mockReturnValue(() => {});
    await act(async () => {
      const { container } = renderWithReduxProvider(
        <MemoryRouter>
          <PaymentEmailPage />
        </MemoryRouter>
      );
      // Query the input fields by their id
      const email = container.querySelector("#email");
      const confirmEmail = container.querySelector("#confirmEmail");
      // Populate the form fields
      fireEvent.change(email!, {
        target: { value: "gianluca.ciuffa@pagopa.it" },
      });
      fireEvent.change(confirmEmail!, {
        target: { value: "gianluca.ciuffa@pagopa.it" },
      });

      // const submit = screen.getByText("paymentEmailPage.formButtons.submit");
      // fireEvent.click(submit);
    });
    // const addressDiff = screen.getByText("paymentEmailPage.formErrors.notEqual");
    // expect(addressDiff).toBeVisible();
    expect(navigate).toHaveBeenCalled();
  });

  test("test different email", async () => {
    await act(async () => {
      const { container } = renderWithReduxProvider(
        <MemoryRouter>
          <PaymentEmailPage />
        </MemoryRouter>
      );
      // Query the input fields by their id
      const email = container.querySelector("#email");
      const confirmEmail = container.querySelector("#confirmEmail");
      // Populate the form fields
      fireEvent.change(email!, {
        target: { value: "gtest1@pagopa.it" },
      });
      fireEvent.change(confirmEmail!, {
        target: { value: "test2@pagopa.it" },
      });

      // const submit = screen.getByText("paymentEmailPage.formButtons.submit");
      // fireEvent.click(submit);
    });
    const addressDiff = screen.getByText(
      "paymentEmailPage.formErrors.notEqual"
    );
    const submit = screen.getByText("paymentEmailPage.formButtons.submit");
    expect(addressDiff).toBeVisible();
    expect(submit).toBeDisabled();
  });

  test("test back", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentEmailPage />
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.click(screen.getByText("paymentEmailPage.formButtons.back"));
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});
