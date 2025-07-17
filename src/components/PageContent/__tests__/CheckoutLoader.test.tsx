// CheckoutLoader.test.tsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import CheckoutLoader from "../CheckoutLoader";

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "ariaLabels.loading": "Loading...",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock MUI components
jest.mock("@mui/material", () => ({
  Box: ({ children, ...props }: any) => {
    // Transform MUI props to style object

    const {
      alignItems,
      bgcolor,
      display,
      height,
      justifyContent,
      left,
      position,
      right,
      top,
      width,
      zIndex,
    } = props;

    const style = {
      ...(alignItems && { alignItems }),
      ...(bgcolor && { backgroundColor: bgcolor }),
      ...(display && { display }),
      ...(height && { height }),
      ...(justifyContent && { justifyContent }),
      ...(left && { left }),
      ...(position && { position }),
      ...(right && { right }),
      ...(top && { top }),
      ...(width && { width }),
      ...(zIndex && { zIndex }),
    };

    // Extract aria and other valid DOM props
    const domProps: Record<string, string> = {};
    if (props["aria-live"]) {
      // eslint-disable-next-line functional/immutable-data
      domProps["aria-live"] = props["aria-live"];
    }
    if (props["aria-label"]) {
      // eslint-disable-next-line functional/immutable-data
      domProps["aria-label"] = props["aria-label"];
    }

    return (
      <div data-testid="box" style={style} {...domProps}>
        {children}
      </div>
    );
  },
  CircularProgress: () => <div data-testid="circular-progress"></div>,
}));

describe("CheckoutLoader Component", () => {
  it("renders correctly", () => {
    render(<CheckoutLoader />);

    // Check if the Box component is rendered
    const boxElement = screen.getByTestId("box");
    expect(boxElement).toBeInTheDocument();

    // Check if the CircularProgress component is rendered
    const circularProgressElement = screen.getByTestId("circular-progress");
    expect(circularProgressElement).toBeInTheDocument();

    // Check if the Box component has the correct styles
    expect(boxElement).toHaveStyle("align-items: center");
    expect(boxElement).toHaveStyle(
      "background-color: palette.background.paper"
    );
    expect(boxElement).toHaveStyle("display: flex");
    expect(boxElement).toHaveStyle("height: 100vh");
    expect(boxElement).toHaveStyle("justify-content: center");
    expect(boxElement).toHaveStyle("left: 0");
    expect(boxElement).toHaveStyle("position: fixed");
    expect(boxElement).toHaveStyle("right: 0");
    expect(boxElement).toHaveStyle("top: 0");
    expect(boxElement).toHaveStyle("width: 100vw");
    expect(boxElement).toHaveStyle("z-index: 999");

    // Check if the Box component has the correct aria attributes
    expect(boxElement).toHaveAttribute("aria-live", "assertive");
    expect(boxElement).toHaveAttribute("aria-label", "Loading...");
  });
});
