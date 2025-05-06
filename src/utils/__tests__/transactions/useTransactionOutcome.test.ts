/* eslint-disable functional/immutable-data */
import { renderHook, act } from "@testing-library/react-hooks";
import * as E from "fp-ts/Either";
import { useTransactionOutcome } from "../../transactions/useTransactionOutcome";
import { apiPaymentEcommerceClient } from "../../api/client";
import { getConfigOrThrow } from "../../config/config";
import { ViewOutcomeEnum } from "../../transactions/TransactionResultUtil";

jest.mock("../../api/client", () => ({
  apiPaymentEcommerceClient: { getTransactionOutcomes: jest.fn() },
}));
jest.mock("../../config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

const pollingInterval = 500;
beforeEach(() => {
  (getConfigOrThrow as jest.Mock).mockReturnValue({
    CHECKOUT_POLLING_ACTIVATION_INTERVAL: pollingInterval,
  });
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

const txId = "tx‑123";
const bearer = "tok‑456";

describe("useTransactionOutcome basic behaviour", () => {
  it("handles final SUCCESS", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(
      E.right({
        status: 200,
        value: {
          outcome: "SUCCESS",
          isFinalStatus: true,
          totalAmount: 9,
          fees: 1,
        },
      })
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(txId, bearer)
    );
    await waitForNextUpdate();

    expect(result.current).toEqual({
      outcome: ViewOutcomeEnum.SUCCESS,
      isFinalStatus: true,
      totalAmount: 10,
      loading: false,
      error: undefined,
    });
  });

  it("propagates decode (Left) errors", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.left("boom"));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(txId, bearer)
    );
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("polling logic & edge cases", () => {
  it("polls once more when isFinalStatus=false then stops", async () => {
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
      useTransactionOutcome(txId, bearer)
    );

    await waitForNextUpdate();
    expect(result.current.loading).toBe(true);
    act(() => jest.advanceTimersByTime(pollingInterval));

    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.outcome).toBe(ViewOutcomeEnum.INVALID_DATA);
  });

  it("treats HTTP≠200 as error", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(E.right({ status: 503, value: {} }));

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(txId, bearer)
    );
    await waitForNextUpdate();

    expect(result.current.error?.message).toContain(
      "Unexpected HTTP status 503"
    );
  });

  it("falls back to GENERIC_ERROR for unknown outcome code", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(
      E.right({
        status: 200,
        value: { outcome: "¯\\_(ツ)_/¯", isFinalStatus: true },
      })
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(txId, bearer)
    );
    await waitForNextUpdate();

    expect(result.current.outcome).toBe(ViewOutcomeEnum.GENERIC_ERROR);
  });

  it("adds totalAmount+fees even when numbers are strings", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValueOnce(
      E.right({
        status: 200,
        value: {
          outcome: "SUCCESS",
          isFinalStatus: true,
          totalAmount: "7",
          fees: "3",
        },
      })
    );

    const { result, waitForNextUpdate } = renderHook(() =>
      useTransactionOutcome(txId, bearer)
    );
    await waitForNextUpdate();
    expect(result.current.totalAmount).toBe(10);
  });

  it("ignores late async updates after unmount", async () => {
    (
      apiPaymentEcommerceClient.getTransactionOutcomes as jest.Mock
    ).mockResolvedValue(
      E.right({
        status: 200,
        value: { outcome: "SUCCESS", isFinalStatus: false },
      })
    );

    const { unmount } = renderHook(() => useTransactionOutcome(txId, bearer));

    act(() => jest.advanceTimersByTime(pollingInterval / 2));
    unmount();
  });
});
