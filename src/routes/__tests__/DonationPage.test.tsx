import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import DonationPage from "../../routes/DonationPage";
import * as reduxHooks from "../../redux/hooks/hooks";
import { getDonationEntityList } from "../../utils/api/helper";

jest.mock("../../utils/api/helper", () => ({
  getDonationEntityList: jest.fn(),
}));
jest.mock("../../redux/hooks/hooks");

const mockStore = configureMockStore([]);
const theme = createTheme();
jest.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(jest.fn());

const renderWithProviders = (ui: React.ReactNode, storeOverride = {}) => {
  const store = mockStore({
    threshold: {},
    ...storeOverride,
  });

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{ui}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe("DonationPage", () => {
  it("renders loading skeleton initially", async () => {
    (getDonationEntityList as jest.Mock).mockImplementationOnce(
      (_err: any, success: (data: any) => void) => {
        setTimeout(() => {
          success([]);
        }, 100);
      }
    );

    const { container } = renderWithProviders(<DonationPage />);
    expect(
      container.querySelector(".MuiSkeleton-circular")
    ).toBeInTheDocument();
  });

  it("renders entity list after loading", async () => {
    const mockEntity = {
      companyName: "Test Entity",
      reason: "Helping people",
      base64Logo: "",
      web_site: "https://example.com",
      slices: [],
      cf: "XYZ123",
    };

    (getDonationEntityList as jest.Mock).mockImplementationOnce(
      (_err: any, success: (data: any) => void) => {
        success([mockEntity]);
      }
    );

    renderWithProviders(<DonationPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Entity")).toBeInTheDocument();
    });
  });

  it("shows error snackbar on API error", async () => {
    (getDonationEntityList as jest.Mock).mockImplementationOnce(
      (err: (msg: string) => void) => {
        err("error.generic");
      }
    );

    renderWithProviders(<DonationPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("selects entity and shows slice buttons", async () => {
    const mockEntity = {
      companyName: "Test Entity",
      reason: "Helping people",
      base64Logo: "",
      web_site: "https://example.com",
      cf: "XYZ123",
      slices: [
        { nav: "/donate", amount: 100 },
        { nav: "/donate", amount: 200 },
      ],
    };

    (getDonationEntityList as jest.Mock).mockImplementationOnce(
      (_err: any, success: (data: any) => void) => {
        success([mockEntity]);
      }
    );

    renderWithProviders(<DonationPage />);

    await waitFor(() => {
      const entity = screen.getByText("Test Entity");
      fireEvent.click(entity);
    });

    expect(screen.getByText("1 €")).toBeInTheDocument();
    expect(screen.getByText("2 €")).toBeInTheDocument();
  });

  it("opens and closes the modal", async () => {
    const mockEntity = {
      companyName: "Test Entity",
      reason: "Helping people",
      base64Logo: "",
      web_site: "https://example.com",
      cf: "XYZ123",
      slices: [{ nav: "/donate", amount: 100 }],
    };

    (getDonationEntityList as jest.Mock).mockImplementationOnce(
      (_err: any, success: (data: any) => void) => {
        success([mockEntity]);
      }
    );

    renderWithProviders(<DonationPage />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Test Entity"));
    });

    fireEvent.click(screen.getByText("1 €"));
    fireEvent.click(screen.getByLabelText("donationPage.submitIO"));

    await waitFor(() => {
      expect(screen.getByText("donationPage.modalTitle")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("errorButton.close"));

    await waitFor(() => {
      expect(
        screen.queryByText("donationPage.modalTitle")
      ).not.toBeInTheDocument();
    });
  });
});
