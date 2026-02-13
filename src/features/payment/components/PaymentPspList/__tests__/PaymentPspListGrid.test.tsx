/* eslint-disable functional/immutable-data */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import userEvent from "@testing-library/user-event";
import { PaymentPSPListGrid } from "../PaymentPspListGrid";
import { PaymentPSPListGridItem } from "../PaymentPspListGridItem";

const useRealGridItemRef = { current: false };

jest.mock("../PaymentPspListGridItem", () => {
  const actual = jest.requireActual("../PaymentPspListGridItem");
  return {
    __esModule: true,
    PaymentPSPListGridItem: jest.fn((props) => {
      if (useRealGridItemRef.current) {
        return actual.PaymentPSPListGridItem(props);
      }

      const { pspItem, isSelected } = props;
      return (
        <label>
          <input
            type="radio"
            name="psp-selector"
            aria-label={pspItem.pspBusinessName}
            value={String(pspItem.idPsp ?? "")}
            defaultChecked={isSelected}
          />
          <span data-selected={isSelected}>{pspItem.pspBusinessName}</span>
        </label>
      );
    }),
  };
});

const theme = createTheme();

// Sample PSP list data
const mockPspList = [
  {
    idPsp: "psp1",
    pspBusinessName: "PSP One",
    onUs: true,
    taxPayerFee: 1.5,
  },
  {
    idPsp: "psp2",
    pspBusinessName: "PSP Two",
    onUs: false,
    taxPayerFee: 2.0,
  },
  {
    idPsp: "psp3",
    pspBusinessName: "PSP Three",
    onUs: false,
    taxPayerFee: 2.5,
  },
];

describe("PaymentPSPListGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRealGridItemRef.current = false;
  });

  it("renders all PSP items from the list", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid pspList={mockPspList} onPspSelected={jest.fn()} />
      </ThemeProvider>
    );

    expect(screen.getByText("PSP One")).toBeInTheDocument();
    expect(screen.getByText("PSP Two")).toBeInTheDocument();
    expect(screen.getByText("PSP Three")).toBeInTheDocument();

    // Verify PaymentPSPListGridItem was called with correct props
    expect(PaymentPSPListGridItem).toHaveBeenCalledTimes(3);
    expect(PaymentPSPListGridItem).toHaveBeenCalledWith(
      expect.objectContaining({
        pspItem: mockPspList[0],
        isSelected: false,
      }),
      expect.anything()
    );
  });

  it("marks the correct PSP item as selected", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid
          pspList={mockPspList}
          onPspSelected={jest.fn()}
          currentSelectedPsp={mockPspList[1]}
        />
      </ThemeProvider>
    );

    // Check that the second PSP is marked as selected
    expect(PaymentPSPListGridItem).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        pspItem: mockPspList[1],
        isSelected: true,
      }),
      expect.anything()
    );

    // Verify other items are not selected
    expect(PaymentPSPListGridItem).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pspItem: mockPspList[0],
        isSelected: false,
      }),
      expect.anything()
    );
    expect(PaymentPSPListGridItem).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        pspItem: mockPspList[2],
        isSelected: false,
      }),
      expect.anything()
    );
  });

  it("calls onPspSelected with the correct PSP when an item is clicked", async () => {
    useRealGridItemRef.current = true;
    const user = userEvent.setup();
    const onPspSelectedMock = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid
          pspList={mockPspList}
          onPspSelected={onPspSelectedMock}
        />
      </ThemeProvider>
    );

    await user.click(screen.getByLabelText("PSP Two"));

    expect(onPspSelectedMock).toHaveBeenCalledTimes(1);
    expect(onPspSelectedMock).toHaveBeenCalledWith(mockPspList[1]);

    useRealGridItemRef.current = false;
  });

  it("handles PSP items without idPsp", () => {
    const pspListWithoutIds = [
      { ...mockPspList[0], idPsp: undefined },
      { ...mockPspList[1], idPsp: undefined },
    ];

    // Spy on console.error to catch any React key warnings
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    // eslint-disable-next-line functional/immutable-data, no-console
    console.error = mockConsoleError;

    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid
          pspList={pspListWithoutIds}
          onPspSelected={jest.fn()}
        />
      </ThemeProvider>
    );

    // Verify that the component renders without errors
    expect(PaymentPSPListGridItem).toHaveBeenCalledTimes(2);

    // Just check that the component was called with the right PSP items
    // without making assumptions about isSelected state
    expect(PaymentPSPListGridItem).toHaveBeenCalledWith(
      expect.objectContaining({
        pspItem: pspListWithoutIds[0],
      }),
      expect.anything()
    );

    expect(PaymentPSPListGridItem).toHaveBeenCalledWith(
      expect.objectContaining({
        pspItem: pspListWithoutIds[1],
      }),
      expect.anything()
    );

    // Verify no React key warnings were logged
    // This indicates the fallback keys are working correctly
    const keyWarnings = mockConsoleError.mock.calls.filter(
      (call) =>
        call[0] && typeof call[0] === "string" && call[0].includes("key")
    );
    expect(keyWarnings.length).toBe(0);

    // Restore console.error
    // eslint-disable-next-line functional/immutable-data, no-console
    console.error = originalConsoleError;
  });

  it("handles empty pspList gracefully", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid pspList={[]} onPspSelected={jest.fn()} />
      </ThemeProvider>
    );

    // Verify PaymentPSPListGridItem was not called
    expect(PaymentPSPListGridItem).not.toHaveBeenCalled();
  });

  it("handles undefined currentSelectedPsp gracefully", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid
          pspList={mockPspList}
          onPspSelected={jest.fn()}
          currentSelectedPsp={undefined}
        />
      </ThemeProvider>
    );

    // Verify all items are rendered as not selected
    mockPspList.forEach((_, index) => {
      expect(PaymentPSPListGridItem).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          isSelected: false,
        }),
        expect.anything()
      );
    });
  });
});
