import { renderHook, act } from "@testing-library/react-hooks";
import * as E from "fp-ts/Either";
import { useTransactionOutcome } from "../../transactions/useTransactionOutcome";
import { apiPaymentEcommerceClient } from "../../api/client";
import { getConfigOrThrow } from "../../config/config";
import { ViewOutcomeEnum } from "../../transactions/TransactionResultUtil";

jest.mock("../../api/client", () => ({
  apiPaymentEcommerceClient: {
    getTransactionOutcomes: jest.fn(),
  },
}));

jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

describe("useTransactionOutcome hook", () => {
  const transactionId = "txn123";
  const bearerAuth = "token456";
  const fakeInterval = 1000;

  beforeEach(() => {
    (getConfigOrThrow as jest.Mock).mockReturnValue({
      CHECKOUT_POLLING_ACTIVATION_INTERVAL: fakeInterval,
    });
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should set state with final outcome when API returns a final success response", async () => {
    const mockResponse = {
      status: 200,
      value: { outcome: "SUCCESS", isFinalStatus: true },
    };
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.right(mockResponse));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(transactionId, bearerAuth)
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.outcome).toBe(ViewOutcomeEnum.SUCCESS);
    expect(result.current.isFinalStatus).toBe(true);
    expect(result.current.error).toBeUndefined();
  });

  it("should handle API decode-failure (Left) and update state with error", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.left("some decode failure"));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(transactionId, bearerAuth)
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useTransactionOutcome polling & error branches", () => {
  const transactionId = "txn123";
  const bearerAuth = "token456";
  const fakeInterval = 500;

  // eslint-disable-next-line sonarjs/no-identical-functions
  beforeEach(() => {
    (getConfigOrThrow as jest.Mock).mockReturnValue({
      CHECKOUT_POLLING_ACTIVATION_INTERVAL: fakeInterval,
    });
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  it("polls again if isFinalStatus is false, then stops on true", async () => {
    const first = {
      status: 200,
      value: { outcome: "SUCCESS", isFinalStatus: false },
    };
    const second = {
      status: 200,
      value: { outcome: "INVALID_DATA", isFinalStatus: true },
    };

    (apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock)
      .mockResolvedValueOnce(E.right(first))
      .mockResolvedValueOnce(E.right(second));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(transactionId, bearerAuth)
    );

    await waitForNextUpdate();
    expect(result.current.loading).toBe(true);
    expect(result.current.outcome).toBe(ViewOutcomeEnum.SUCCESS);
    expect(result.current.isFinalStatus).toBe(false);

    act(() => {
      jest.advanceTimersByTime(fakeInterval);
    });

    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.outcome).toBe(ViewOutcomeEnum.INVALID_DATA);
    expect(result.current.isFinalStatus).toBe(true);
  });

  it("treats non-200 HTTP status as an error", async () => {
    const bad = { status: 503, value: {} };
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.right(bad));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(transactionId, bearerAuth)
    );

    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toContain(
      "Unexpected HTTP status 503"
    );
  });

  it("falls back to GENERIC_ERROR if the raw outcome string isn’t in the enum", async () => {
    const raw = { status: 200, value: { outcome: "WTF", isFinalStatus: true } };
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.right(raw));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(transactionId, bearerAuth)
    );
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.outcome).toBe(ViewOutcomeEnum.GENERIC_ERROR);
  });
});
