import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import { Layout } from "../Layout";

// Mock the Header and Footer components
jest.mock("../Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock("../Footer", () => ({
  __esModule: true,
  default: ({ fixedPages }: { fixedPages: Array<string> }) => (
    <footer data-testid="footer">Footer - {fixedPages.join(", ")}</footer>
  ),
}));

describe("Layout Component", () => {
  const theme = createTheme(); // Create a basic theme for testing

  const renderWithTheme = (
    children: React.ReactNode,
    fixedFooterPages: Array<string> = []
  ) =>
    render(
      <ThemeProvider theme={theme}>
        <Layout fixedFooterPages={fixedFooterPages}>{children}</Layout>
      </ThemeProvider>
    );

  it("renders the Layout with Header, Container, and Footer", () => {
    renderWithTheme(<div>Content</div>);

    // Check if Header and Footer are rendered
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();

    // Check if the content is rendered within the Container
    expect(screen.getByText("Content")).toBeInTheDocument();

    // Check if the main content has the correct ID
    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("id", "main_content");
  });

  it("passes fixedFooterPages to the Footer component", () => {
    const fixedPages = ["page1", "page2"];
    renderWithTheme(<div>Content</div>, fixedPages);

    // Check if Footer receives the correct fixedPages
    expect(screen.getByTestId("footer")).toHaveTextContent(
      "Footer - page1, page2"
    );
  });

  it("applies custom sx styles to the Container", () => {
    const sx = { backgroundColor: "red" };
    render(
      <ThemeProvider theme={theme}>
        <Layout fixedFooterPages={[]} sx={sx}>
          <div>Content</div>
        </Layout>
      </ThemeProvider>
    );

    // Check if the Container has the custom background color
    const container = screen.getByRole("main");
    expect(container).toHaveStyle("background-color: red");
  });

  it("renders children within the Container", () => {
    renderWithTheme(<h1>Hello World</h1>);
    expect(
      screen.getByRole("heading", { level: 1, name: "Hello World" })
    ).toBeInTheDocument();
  });

  it("sets tabIndex to -1 on the main content container", () => {
    renderWithTheme(<div>Content</div>);
    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("tabIndex", "-1");
  });
});
