// PageContainer.test.tsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import PageContainer from "../PageContainer";

// Mock the useTranslation hook and Trans component
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      // Simple translation function that returns the key with a prefix
      `Translated: ${key}`,
  }),
  Trans: ({
    i18nKey,
    children,
  }: {
    i18nKey: string;
    children?: React.ReactNode;
  }) => (
    <span data-testid="trans-component">
      Translated: {i18nKey}
      {children}
    </span>
  ),
}));

// Mock MUI components
jest.mock("@mui/material", () => ({
  // eslint-disable-next-line sonarjs/cognitive-complexity
  Box: ({ children, sx, mt, mb, ...props }: any) => {
    // Transform MUI props to style object
    const style: Record<string, string> = {};

    if (mt) {
      // eslint-disable-next-line functional/immutable-data
      style.marginTop = typeof mt === "number" ? `${mt * 8}px` : mt;
    }
    if (mb) {
      // eslint-disable-next-line functional/immutable-data
      style.marginBottom = typeof mb === "number" ? `${mb * 8}px` : mb;
    }

    // Add any sx styles if provided
    if (sx) {
      if (sx.mt) {
        // eslint-disable-next-line functional/immutable-data
        style.marginTop = typeof sx.mt === "number" ? `${sx.mt * 8}px` : sx.mt;
      }
      if (sx.mb) {
        // eslint-disable-next-line functional/immutable-data
        style.marginBottom =
          typeof sx.mb === "number" ? `${sx.mb * 8}px` : sx.mb;
      }
      // Add other sx properties as needed
    }

    return (
      <div data-testid="box-component" style={style} {...props}>
        {children}
      </div>
    );
  },
  Typography: ({ children, variant, component, sx, ...props }: any) => {
    // Transform MUI props to style object
    const style: Record<string, string> = {};

    // Add any sx styles if provided
    if (sx) {
      if (sx.mt) {
        // eslint-disable-next-line functional/immutable-data
        style.marginTop = typeof sx.mt === "number" ? `${sx.mt * 8}px` : sx.mt;
      }
      if (sx.mb) {
        // eslint-disable-next-line functional/immutable-data
        style.marginBottom =
          typeof sx.mb === "number" ? `${sx.mb * 8}px` : sx.mb;
      }
      // Add other sx properties as needed
    }

    return (
      <div
        data-testid="typography-component"
        data-variant={variant}
        data-component={component}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
}));

describe("PageContainer Component", () => {
  // Mock for document.title
  // eslint-disable-next-line functional/immutable-data
  const originalDocumentTitle = document.title;

  beforeEach(() => {
    // Reset document.title before each test
    // eslint-disable-next-line functional/immutable-data
    document.title = originalDocumentTitle;
  });

  it("renders correctly with minimal props", () => {
    render(<PageContainer />);

    // Check if the main Box component is rendered - use getAllByTestId and get the first one (root Box)
    const boxElements = screen.getAllByTestId("box-component");
    const rootBox = boxElements[0]; // First Box is the root container

    expect(rootBox).toBeInTheDocument();
    expect(rootBox).toHaveAttribute("aria-live", "polite");
    expect(rootBox).toHaveStyle("margin-top: 24px"); // mt={3} * 8px = 24px
    expect(rootBox).toHaveStyle("margin-bottom: 48px"); // mb={6} * 8px = 48px

    // Check that title and description are not rendered
    expect(screen.queryByText(/Translated:/)).not.toBeInTheDocument();
  });

  it("renders title correctly", () => {
    render(<PageContainer title="page.title" />);

    // Check if the title is rendered
    const titleElement = screen.getByText("Translated: page.title");
    expect(titleElement).toBeInTheDocument();

    // Check if document.title is updated
    expect(document.title).toBe("Translated: page.title - pagoPA");

    // Check if Typography has correct variant and component
    const typographyElement = screen.getByTestId("typography-component");
    expect(typographyElement).toHaveAttribute("data-variant", "h4");
    expect(typographyElement).toHaveAttribute("data-component", "div");
  });

  it("renders description correctly", () => {
    render(<PageContainer description="page.description" />);

    // Check if the description is rendered using Trans component
    const transElement = screen.getByTestId("trans-component");
    expect(transElement).toBeInTheDocument();
    expect(transElement).toHaveTextContent("Translated: page.description");

    // Check if Typography has correct variant and styling
    const typographyElement = screen.getByTestId("typography-component");
    expect(typographyElement).toHaveAttribute("data-variant", "body2");
    expect(typographyElement).toHaveStyle("margin-top: 8px");
    expect(typographyElement).toHaveStyle("margin-bottom: 8px");
  });

  it("renders link when provided", () => {
    const linkElement = <a href="https://pagopa.it">Test Link</a>;
    render(<PageContainer description="page.description" link={linkElement} />);

    // Check if the link is rendered
    const link = screen.getByText("Test Link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://pagopa.it");
  });

  it("applies childrenSx to children container", () => {
    const childrenSx = { mt: 4, mb: 2 };
    render(
      <PageContainer childrenSx={childrenSx}>
        <div data-testid="child-element">Child Content</div>
      </PageContainer>
    );

    // Find the Box that contains children - it's the last Box in the component
    const boxElements = screen.getAllByTestId("box-component");
    const childrenBox = boxElements[boxElements.length - 1]; // Last Box is the children container

    // Check if childrenSx styles are applied
    expect(childrenBox).toHaveStyle("margin-top: 32px"); // mt={4} * 8px = 32px
    expect(childrenBox).toHaveStyle("margin-bottom: 16px"); // mb={2} * 8px = 16px

    // Check if children are rendered
    const childElement = screen.getByTestId("child-element");
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent("Child Content");
  });

  it("renders all elements together correctly", () => {
    const linkElement = <a href="https://pagopa.it">Test Link</a>;
    const childrenSx = { mt: 3 };

    render(
      <PageContainer
        title="page.title"
        description="page.description"
        link={linkElement}
        childrenSx={childrenSx}
      >
        <div data-testid="child-element">Child Content</div>
      </PageContainer>
    );

    // Check if title is rendered
    expect(screen.getByText("Translated: page.title")).toBeInTheDocument();

    // Check if description is rendered
    expect(screen.getByTestId("trans-component")).toBeInTheDocument();

    // Check if link is rendered
    expect(screen.getByText("Test Link")).toBeInTheDocument();

    // Check if children are rendered
    expect(screen.getByTestId("child-element")).toBeInTheDocument();

    // Check if document.title is updated
    expect(document.title).toBe("Translated: page.title - pagoPA");
  });

  it("updates document title when title prop changes", () => {
    const { rerender } = render(<PageContainer title="page.title.initial" />);
    expect(document.title).toBe("Translated: page.title.initial - pagoPA");

    // Update the title prop
    rerender(<PageContainer title="page.title.updated" />);
    expect(document.title).toBe("Translated: page.title.updated - pagoPA");
  });
});
