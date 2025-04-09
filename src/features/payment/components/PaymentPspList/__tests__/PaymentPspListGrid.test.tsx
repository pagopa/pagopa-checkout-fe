import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { PaymentPSPListGrid } from "../PaymentPspListGrid";
import { PaymentPSPListGridItem } from "../PaymentPspListGridItem";

jest.mock("../PaymentPspListGridItem", () => ({
  PaymentPSPListGridItem: jest.fn(({ pspItem, isSelected, handleClick }) => (
    <div
      data-testid={`psp-item-${pspItem.idPsp || pspItem.pspBusinessName}`}
      data-selected={isSelected}
      onClick={handleClick}
    >
      {pspItem.pspBusinessName}
    </div>
  )),
}));

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
        handleClick: expect.any(Function),
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

  it("calls onPspSelected with the correct PSP when an item is clicked", () => {
    const onPspSelectedMock = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGrid
          pspList={mockPspList}
          onPspSelected={onPspSelectedMock}
        />
      </ThemeProvider>
    );

    // Click on the second PSP item
    fireEvent.click(screen.getByText("PSP Two"));

    // Verify onPspSelected was called with the correct PSP
    expect(onPspSelectedMock).toHaveBeenCalledTimes(1);
    expect(onPspSelectedMock).toHaveBeenCalledWith(mockPspList[1]);
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
        handleClick: expect.any(Function),
      }),
      expect.anything()
    );

    expect(PaymentPSPListGridItem).toHaveBeenCalledWith(
      expect.objectContaining({
        pspItem: pspListWithoutIds[1],
        handleClick: expect.any(Function),
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
