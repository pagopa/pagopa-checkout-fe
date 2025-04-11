import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import NoticeGuard from "../NoticeGuard";
import { SessionItems } from "../../../utils/storage/sessionStorage";

// Mock the sessionStorage module
jest.mock("../../../utils/storage/sessionStorage", () => ({
  SessionItems: {
    paymentInfo: "paymentInfo",
    cart: "cart",
  },
  getSessionItem: jest.fn(),
}));

// Import the mocked function
import { getSessionItem } from "../../../utils/storage/sessionStorage";

describe("NoticeGuard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when paymentInfo.rptId exists", () => {
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return { rptId: "someRptId" };
      }
      return undefined;
    });

    render(
      <MemoryRouter>
        <NoticeGuard>
          <div>Protected Content</div>
        </NoticeGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children when cart.emailNotice exists", () => {
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.cart) {
        return { emailNotice: "someEmailNotice" };
      }
      return undefined;
    });

    render(
      <MemoryRouter>
        <NoticeGuard>
          <div>Protected Content</div>
        </NoticeGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it('navigates to "/" when neither paymentInfo.rptId nor cart.emailNotice exist', () => {
    (getSessionItem as jest.Mock).mockReturnValue(undefined);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <NoticeGuard>
                <div>Protected Content</div>
              </NoticeGuard>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders children when both paymentInfo.rptId and cart.emailNotice exist", () => {
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return { rptId: "someRptId" };
      }
      if (key === SessionItems.cart) {
        return { emailNotice: "someEmailNotice" };
      }
      return undefined;
    });

    render(
      <MemoryRouter>
        <NoticeGuard>
          <div>Protected Content</div>
        </NoticeGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
