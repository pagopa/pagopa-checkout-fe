import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { ImageComponent } from "../PaymentMethodImage";

// Mock MUI icons
jest.mock(
  "@mui/icons-material/MobileFriendly",
  () =>
    function MockMobileFriendlyIcon(props: any) {
      return (
        <div
          data-testid="mobile-friendly-icon"
          data-color={props.color}
          className={props.sx?.color ? "disabled-icon" : ""}
        >
          Icon
        </div>
      );
    }
);

const theme = createTheme({
  palette: {
    text: {
      primary: "#000000",
      disabled: "#cccccc",
    },
  } as any,
});

describe("ImageComponent", () => {
  test("renders default icon when no asset is provided", () => {
    render(
      <ThemeProvider theme={theme}>
        <ImageComponent name="Test Method" />
      </ThemeProvider>
    );

    expect(screen.getByTestId("mobile-friendly-icon")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-friendly-icon")).toHaveAttribute(
      "data-color",
      "primary"
    );
  });

  test("renders default icon when asset is undefined", () => {
    render(
      <ThemeProvider theme={theme}>
        <ImageComponent name="Test Method" asset={undefined} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("mobile-friendly-icon")).toBeInTheDocument();
  });

  test("renders image when asset is provided", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageComponent
          name="Test Method"
          asset="https://example.com/logo.png"
        />
      </ThemeProvider>
    );

    // Use container.querySelector instead of getByRole since the img has aria-hidden="true"
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
    expect(img).toHaveAttribute("alt", "Logo Test Method");
    expect(img).toHaveAttribute("aria-hidden", "true");
  });

  test("falls back to default icon when image fails to load", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageComponent
          name="Test Method"
          asset="https://example.com/invalid.png"
        />
      </ThemeProvider>
    );

    // Use container.querySelector instead of getByRole
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();

    // Simulate image load error
    fireEvent.error(img!);

    // Default icon should be rendered after error
    expect(screen.getByTestId("mobile-friendly-icon")).toBeInTheDocument();
  });

  test("applies disabled styling to default icon when disabled", () => {
    render(
      <ThemeProvider theme={theme}>
        <ImageComponent name="Test Method" disabled={true} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("mobile-friendly-icon")).toHaveClass(
      "disabled-icon"
    );
  });

  test("applies disabled styling to image when disabled", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageComponent
          name="Test Method"
          asset="https://example.com/logo.png"
          disabled={true}
        />
      </ThemeProvider>
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();

    // Check that the style includes the disabled color
    expect(img!.style.color).toBe("rgb(204, 204, 204)"); // #cccccc
  });

  test("applies correct image size", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageComponent
          name="Test Method"
          asset="https://example.com/logo.png"
        />
      </ThemeProvider>
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img!.style.width).toBe("23px");
    expect(img!.style.height).toBe("23px");
  });
});
