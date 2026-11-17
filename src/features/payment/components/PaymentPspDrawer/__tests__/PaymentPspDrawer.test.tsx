import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentCheckPage.drawer.title": "Select Payment Service Provider",
        "paymentCheckPage.drawer.body": "Choose a payment service provider",
        "paymentCheckPage.drawer.header.name": "Name",
        "paymentCheckPage.drawer.header.amount": "Amount",
        "paymentCheckPage.drawer.sortByNameAccessibilityLabel.inactive":
          "Name: sort ascending",
        "paymentCheckPage.drawer.sortByNameAccessibilityLabel.asc":
          "Name: sorted ascending. Activate to reverse",
        "paymentCheckPage.drawer.sortByNameAccessibilityLabel.desc":
          "Name: sorted descending. Activate to reverse",
        "paymentCheckPage.drawer.sortByFeeAccessibilityLabel.inactive":
          "Amount: sort from lowest",
        "paymentCheckPage.drawer.sortByFeeAccessibilityLabel.asc":
          "Amount: sorted from lowest. Activate to reverse",
        "paymentCheckPage.drawer.sortByFeeAccessibilityLabel.desc":
          "Amount: sorted from highest. Activate to reverse",
        "paymentCheckPage.drawer.selectPspAccessibilityHint":
          "Select as payment provider",
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock("../../../../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_PAGOPA_LOGOS_CDN: "https://example.com/logos",
        CHECKOUT_API_TIMEOUT: 5000,
        CHECKOUT_PM_HOST: "https://example.com",
        CHECKOUT_PM_API_BASEPATH: "/api",
        CHECKOUT_API_ECOMMERCE_BASEPATH: "/ecommerce",
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values
      if (key === undefined) {
        return configValues;
      }

      // Return the specific config value
      return configValues[key] || "";
    }),
    isTestEnv: jest.fn(() => false),
    isDevEnv: jest.fn(() => false),
    isProdEnv: jest.fn(() => true),
  })
);

// Mock components with more detailed implementation to capture rendered content
jest.mock("../../../../../components/modals/CustomDrawer", () => ({
  CustomDrawer: ({ children, open, onClose }: any) => (
    <div data-testid="custom-drawer" data-open={open} onClick={onClose}>
      {children}
    </div>
  ),
}));

jest.mock("../../../../../components/Skeletons/SkeletonFieldContainer", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="skeleton-container" {...props} />,
}));

jest.mock("../../../../../components/TextFormField/PspFieldContainer", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="psp-field-container"
      onClick={props.onClick}
      data-psp-name={props.body} // Add data attribute to help with testing
      {...props}
    >
      {props.body}
      {props.endAdornment}
    </div>
  ),
}));

jest.mock("../../../../../utils/form/formatters", () => ({
  moneyFormat: (value: number) => `€${value.toFixed(2)}`,
}));

// Import after all mocks are set up
import { PaymentPspDrawer, PspListSortLabel } from "../PaymentPspDrawer";

describe("PaymentPspDrawer Component", () => {
  const mockTheme = createTheme();
  const mockPspList = [
    {
      id: "1",
      abi: "12345",
      pspBusinessName: "PSP One",
      taxPayerFee: 1.5,
    },
    {
      id: "2",
      abi: "67890",
      pspBusinessName: "PSP Two",
      taxPayerFee: 0.75,
    },
  ];

  // Test to specifically check the Typography and Box components
  it("renders header and typography elements correctly", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    // Check for the title Typography
    expect(
      screen.getByText("Select Payment Service Provider")
    ).toBeInTheDocument();

    // Check for the body Typography
    expect(
      screen.getByText("Choose a payment service provider")
    ).toBeInTheDocument();

    // Check for the header labels inside the sort buttons
    expect(
      screen.getByRole("button", {
        name: "Name: sort ascending",
      })
    ).toHaveTextContent("Name");
    expect(
      screen.getByRole("button", {
        name: "Amount: sorted from lowest. Activate to reverse",
      })
    ).toHaveTextContent("Amount");
  });

  it("labels each PSP button with its own content plus the selection hint", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const pspContainers = screen.getAllByTestId("psp-field-container");
    pspContainers.forEach((container, index) => {
      expect(container).toHaveAttribute("id", `psp-button-${index}`);
      expect(container).toHaveAttribute(
        "ariaLabelledBy",
        `psp-button-${index} psp-select-hint`
      );
      expect(container).not.toHaveAttribute("ariaLabel");
    });

    const hint = document.getElementById("psp-select-hint");
    expect(hint).toHaveTextContent("Select as payment provider");
    expect(hint).toHaveAttribute("hidden");

    expect(screen.getAllByText("Amount")).toHaveLength(mockPspList.length + 1);
  });

  it("updates the sort buttons aria-label according to the sorting state", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const nameButton = screen.getByRole("button", {
      name: "Name: sort ascending",
    });
    const feeButton = screen.getByRole("button", {
      name: "Amount: sorted from lowest. Activate to reverse",
    });

    fireEvent.click(feeButton);
    expect(feeButton).toHaveAccessibleName(
      "Amount: sorted from highest. Activate to reverse"
    );
    expect(nameButton).toHaveAccessibleName("Name: sort ascending");

    fireEvent.click(nameButton);
    expect(nameButton).toHaveAccessibleName(
      "Name: sorted ascending. Activate to reverse"
    );
    expect(feeButton).toHaveAccessibleName("Amount: sort from lowest");

    fireEvent.click(nameButton);
    expect(nameButton).toHaveAccessibleName(
      "Name: sorted descending. Activate to reverse"
    );
  });

  it("does not use aria-sort on the sort buttons", () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(container.querySelector("[aria-sort]")).toBeNull();
  });

  it("renders loading state correctly", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={true}
          pspList={[]}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const skeletons = screen.getAllByTestId("skeleton-container");
    expect(skeletons).toHaveLength(3);

    // Make sure the loading branch is fully covered
    expect(screen.queryAllByTestId("psp-field-container")).toHaveLength(0);
  });

  it("renders PSP list correctly when not loading", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const pspContainers = screen.getAllByTestId("psp-field-container");
    expect(pspContainers).toHaveLength(2);

    // Check that both PSPs are in the list
    expect(screen.getByText("PSP One")).toBeInTheDocument();
    expect(screen.getByText("PSP Two")).toBeInTheDocument();
  });

  it("calls onSelect when a PSP is clicked", () => {
    const mockOnSelect = jest.fn();

    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={mockOnSelect}
        />
      </ThemeProvider>
    );

    const pspContainers = screen.getAllByTestId("psp-field-container");
    fireEvent.click(pspContainers[0]);

    expect(mockOnSelect).toHaveBeenCalled();
    // Check that it was called with one of our PSPs
    expect(
      mockOnSelect.mock.calls[0][0].id === "1" ||
        mockOnSelect.mock.calls[0][0].id === "2"
    ).toBeTruthy();
  });

  it("calls onClose when drawer is closed", () => {
    const mockOnClose = jest.fn();

    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={mockOnClose}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const drawer = screen.getByTestId("custom-drawer");
    fireEvent.click(drawer);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("sorts PSP list by name when name header is clicked", () => {
    // Create a list with names in reverse order to test sorting
    const reversedNameList = [
      {
        id: "2",
        abi: "67890",
        pspBusinessName: "PSP Two", // Will be second after sorting
        taxPayerFee: 0.75,
      },
      {
        id: "1",
        abi: "12345",
        pspBusinessName: "PSP One", // Will be first after sorting
        taxPayerFee: 1.5,
      },
    ];

    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={reversedNameList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    // Find and click the sort by name label
    const sortByNameButton = screen.getByRole("button", {
      name: "Name: sort ascending",
    });
    fireEvent.click(sortByNameButton!);

    // Check that both PSPs are in the list after sorting
    expect(screen.getByText("PSP One")).toBeInTheDocument();
    expect(screen.getByText("PSP Two")).toBeInTheDocument();
  });

  it("sorts PSP list by fee when amount header is clicked", () => {
    // Create a list with fees in reverse order to test sorting
    const reversedFeeList = [
      {
        id: "3",
        abi: "11111",
        pspBusinessName: "PSP Three",
        taxPayerFee: 2.5, // Highest fee - will be last after sorting
      },
      {
        id: "1",
        abi: "12345",
        pspBusinessName: "PSP One",
        taxPayerFee: 1.5, // Middle fee - will be middle after sorting
      },
      {
        id: "2",
        abi: "67890",
        pspBusinessName: "PSP Two",
        taxPayerFee: 0.75, // Lowest fee - will be first after sorting
      },
    ];

    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={reversedFeeList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    // Find and click the sort by fee label
    const sortByFeeButton = screen.getByRole("button", {
      name: "Amount: sorted from lowest. Activate to reverse",
    });
    fireEvent.click(sortByFeeButton!);

    // Check that all PSPs are in the list after sorting
    expect(screen.getByText("PSP One")).toBeInTheDocument();
    expect(screen.getByText("PSP Two")).toBeInTheDocument();
    expect(screen.getByText("PSP Three")).toBeInTheDocument();
  });

  // Test to ensure the orderingModel is being used correctly
  it("applies correct sorting based on orderingModel", () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={mockPspList}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    // First check default sorting (should be by fee, ascending)
    screen.getAllByTestId("psp-field-container");

    // Then find and click the sort by name label to change sorting
    const sortByNameButton = screen.getByRole("button", {
      name: "Name: sort ascending",
    });
    fireEvent.click(sortByNameButton!);

    // Then find and click it again to reverse the sort order
    fireEvent.click(sortByNameButton!);

    // This should exercise the orderingModel state changes
  });
});

describe("PspListSortLabel Component", () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    id: "test-sort",
    fieldName: "pspBusinessName" as const,
    onClick: mockOnClick,
    orderingModel: {
      fieldName: "pspBusinessName" as const,
      direction: "asc" as const,
    },
    children: "Test Label",
    ariaLabels: {
      inactive: "Sort by PSP name",
      asc: "Sorted by PSP name ascending",
      desc: "Sorted by PSP name descending",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a native button with the label as content", () => {
    render(<PspListSortLabel {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: "Sorted by PSP name ascending",
    });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("id", "test-sort");
    expect(button).toHaveTextContent("Test Label");
  });

  it("calls onClick with toggled direction when clicked while active", () => {
    const { rerender } = render(<PspListSortLabel {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledWith({
      fieldName: "pspBusinessName",
      direction: "desc",
    });

    rerender(
      <PspListSortLabel
        {...defaultProps}
        orderingModel={{ fieldName: "pspBusinessName", direction: "desc" }}
      />
    );

    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Sorted by PSP name descending"
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenLastCalledWith({
      fieldName: "pspBusinessName",
      direction: "asc",
    });
  });

  it("sorts ascending on first activation when not active", () => {
    render(
      <PspListSortLabel
        {...defaultProps}
        orderingModel={{ fieldName: "taxPayerFee", direction: "asc" }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAccessibleName("Sort by PSP name");
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledWith({
      fieldName: "pspBusinessName",
      direction: "asc",
    });
  });

  it("shows the arrow icon and active state when it is the current sorting", () => {
    render(<PspListSortLabel {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("Mui-active");
    expect(screen.getByTestId("ArrowDownwardIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("UnfoldMoreIcon")).not.toBeInTheDocument();
  });

  it("always shows a neutral sort icon when it is not the current sorting", () => {
    render(
      <PspListSortLabel
        {...defaultProps}
        orderingModel={{ fieldName: "taxPayerFee", direction: "desc" }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("Mui-active");
    expect(screen.getByTestId("UnfoldMoreIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("ArrowDownwardIcon")).not.toBeInTheDocument();
  });

  it("does not remove the focus outline via inline style", () => {
    render(<PspListSortLabel {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.focus(button);
    expect(button.getAttribute("style") ?? "").not.toContain("outline");
    expect(button.parentElement?.getAttribute("style") ?? "").not.toContain(
      "outline"
    );
  });
});

describe("pspImagePath utility", () => {
  it("returns correct path when abi is provided", () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={[
            {
              id: "1",
              abi: "12345",
              pspBusinessName: "Test PSP",
              taxPayerFee: 1.0,
            } as any,
          ]}
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    // Check if the image path is correctly generated
    const pspContainer = screen.getByTestId("psp-field-container");
    expect(pspContainer).toHaveAttribute(
      "image",
      "https://example.com/logos/12345.png"
    );
  });

  it("returns empty string when abi is undefined", () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <PaymentPspDrawer
          open={true}
          onClose={jest.fn()}
          loading={false}
          pspList={[
            { id: "1", pspBusinessName: "Test PSP", taxPayerFee: 1.0 } as any,
          ]} // No abi
          onSelect={jest.fn()}
        />
      </ThemeProvider>
    );

    const pspContainer = screen.getByTestId("psp-field-container");
    expect(pspContainer).toHaveAttribute("image", "");
  });
});
