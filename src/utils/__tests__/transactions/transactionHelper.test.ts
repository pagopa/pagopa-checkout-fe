jest.mock("../../mixpanel/mixpanelHelperInit", () => ({
  mixpanel: { track: jest.fn() },
}));

jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  constantPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
}));

jest.mock("../../config/fetch", () => ({
  retryingFetch: jest.fn(() => jest.fn()),
  exponetialPollingWithPromisePredicateFetch: jest.fn(() => jest.fn()),
}));

import * as E from "fp-ts/Either";
import { UNKNOWN } from "../../transactions/TransactionStatesTypes";
import { ecommerceTransactionOutcome } from "../../transactions/transactionHelper";
import { Client as ClientV1 } from "../../../../generated/definitions/payment-ecommerce/client";
import { TransactionOutcomeInfo } from "../../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";

const v1TransactionId = "123-v1";
const bearerAuth = "Bearer token";

const mockOutcomeInfo: TransactionOutcomeInfo = {
  outcome: 0,
  isFinalStatus: true,
  totalAmount: 1000 as any,
  fees: 100 as any,
};

describe("ecommerceTransactionOutcome (v1)", () => {
  afterEach(() => jest.clearAllMocks());

  it("should succeed and return TransactionOutcomeInfo on 200", async () => {
    const client: ClientV1 = {
      getTransactionOutcomes: jest
        .fn()
        .mockResolvedValue(E.right({ status: 200, value: mockOutcomeInfo })),
    } as unknown as ClientV1;

    const res = await ecommerceTransactionOutcome(
      v1TransactionId,
      bearerAuth,
      client
    )();

    expect(res).toEqual(E.right(mockOutcomeInfo));
  });

  it("should fail when status !== 200", async () => {
    const client = {
      getTransactionOutcomes: jest
        .fn()
        .mockResolvedValue(E.right({ status: 500, value: mockOutcomeInfo })),
    } as unknown as ClientV1;

    const res = await ecommerceTransactionOutcome(
      v1TransactionId,
      bearerAuth,
      client
    )();

    expect(res).toEqual(E.left(UNKNOWN.value));
  });

  it("should fail when getTransactionOutcomes returns a Left", async () => {
    const client = {
      getTransactionOutcomes: jest
        .fn()
        .mockResolvedValue(E.left(new Error("backend error"))),
    } as unknown as ClientV1;

    const res = await ecommerceTransactionOutcome(
      v1TransactionId,
      bearerAuth,
      client
    )();

    expect(res).toEqual(E.left(UNKNOWN.value));
  });

  it("should handle network-level rejection (NET_ERR + SVR_ERR)", async () => {
    const client = {
      getTransactionOutcomes: jest.fn().mockRejectedValue(new Error("timeout")),
    } as unknown as ClientV1;

    const res = await ecommerceTransactionOutcome(
      v1TransactionId,
      bearerAuth,
      client
    )();

    expect(res).toEqual(E.left(UNKNOWN.value));
  });
});
