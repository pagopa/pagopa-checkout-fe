import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Guard from "../Guard";
import {
  SessionItems,
  isStateEmpty,
} from "../../../utils/storage/sessionStorage";

// Mock the sessionStorage utils
jest.mock("../../../utils/storage/sessionStorage", () => ({
  SessionItems: {
    paymentInfo: "paymentInfo",
    noticeInfo: "rptId",
    useremail: "useremail",
    enableAuthentication: "enableAuthentication",
    enablePspPage: "enablePspPage",
    paymentMethod: "paymentMethod",
    pspSelected: "pspSelected",
    sessionToken: "sessionToken",
    cart: "cart",
    transaction: "transaction",
    sessionPaymentMethod: "sessionPayment",
    paymentMethodInfo: "paymentMethodInfo",
    orderId: "orderId",
    correlationId: "correlationId",
    cartClientId: "cartClientId",
    loginOriginPage: "loginOriginPage",
    authToken: "authToken",
  },
  isStateEmpty: jest.fn(),
}));

describe("Guard Component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when session item exists", () => {
    // Mock isStateEmpty to return false (-> not empty)
    (isStateEmpty as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.sessionToken}>
                <div data-testid="protected-content">Protected Content</div>
              </Guard>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the protected content is rendered
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();

    // Verify isStateEmpty was called with the correct parameter
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.sessionToken);
  });

  it("redirects to home when session item is empty", () => {
    // Mock isStateEmpty to return true (-> empty)
    (isStateEmpty as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.paymentInfo}>
                <div data-testid="protected-content">Protected Content</div>
              </Guard>
            }
          />
          <Route
            path="/"
            element={<div data-testid="home-page">Home Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Check that we've been redirected to the home page
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
    expect(screen.getByText("Home Page")).toBeInTheDocument();

    // Check that the protected content is not rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

    // Verify isStateEmpty was called with the correct parameter
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.paymentInfo);
  });

  it("works with different session items", () => {
    // Mock isStateEmpty to return false (-> not empty)
    (isStateEmpty as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.useremail}>
                <div data-testid="protected-content">Protected Content</div>
              </Guard>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the protected content is rendered
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    // Verify isStateEmpty was called with the correct parameter
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.useremail);
  });

  it("nested guards work correctly when all items exist", () => {
    // Mock isStateEmpty to return false (-> not empty)
    (isStateEmpty as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.sessionToken}>
                <Guard item={SessionItems.paymentInfo}>
                  <div data-testid="nested-protected-content">
                    Nested Protected Content
                  </div>
                </Guard>
              </Guard>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the nested protected content is rendered
    expect(screen.getByTestId("nested-protected-content")).toBeInTheDocument();

    // Verify isStateEmpty was called with correct parameters
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.sessionToken);
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.paymentInfo);
  });

  it("nested guards redirect when inner item is empty", () => {
    // Mock isStateEmpty to return false (not empty) for first call and true for second call (empty)
    (isStateEmpty as jest.Mock)
      .mockReturnValueOnce(false) // First call (outer guard)
      .mockReturnValueOnce(true); // Second call (inner guard)

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.sessionToken}>
                <Guard item={SessionItems.paymentInfo}>
                  <div data-testid="nested-protected-content">
                    Nested Protected Content
                  </div>
                </Guard>
              </Guard>
            }
          />
          <Route
            path="/"
            element={<div data-testid="home-page">Home Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Check that we've been redirected to the home page
    expect(screen.getByTestId("home-page")).toBeInTheDocument();

    // Check that the nested protected content is not rendered
    expect(
      screen.queryByTestId("nested-protected-content")
    ).not.toBeInTheDocument();

    // Verify isStateEmpty was called with both parameters
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.sessionToken);
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.paymentInfo);
  });

  it("nested guards redirect when outer item is empty", () => {
    // Mock isStateEmpty to return true (outer item is empty)
    (isStateEmpty as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <Guard item={SessionItems.sessionToken}>
                <Guard item={SessionItems.paymentInfo}>
                  <div data-testid="nested-protected-content">
                    Nested Protected Content
                  </div>
                </Guard>
              </Guard>
            }
          />
          <Route
            path="/"
            element={<div data-testid="home-page">Home Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Check that we've been redirected to the home page
    expect(screen.getByTestId("home-page")).toBeInTheDocument();

    // Check that the nested protected content is not rendered
    expect(
      screen.queryByTestId("nested-protected-content")
    ).not.toBeInTheDocument();

    // Verify isStateEmpty was called with the first parameter only
    // (the redirect happens before the second guard is evaluated)
    expect(isStateEmpty).toHaveBeenCalledWith(SessionItems.sessionToken);
    expect(isStateEmpty).not.toHaveBeenCalledWith(SessionItems.paymentInfo);
  });
});
