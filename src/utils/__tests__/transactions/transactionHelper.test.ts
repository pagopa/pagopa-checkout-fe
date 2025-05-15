import * as E from "fp-ts/Either";
import { UNKNOWN } from "../../transactions/TransactionStatesTypes";
import { TransactionInfo } from "../../../../generated/definitions/payment-ecommerce-v2/TransactionInfo";
import { ecommerceTransaction } from "../../transactions/transactionHelper";
import { Client } from "../../../../generated/definitions/payment-ecommerce-v2/client";
import { TransactionStatusEnum } from "../../../../generated/definitions/payment-ecommerce-v3/TransactionStatus";

jest.mock("../../config/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

describe("ecommerceTransaction", () => {
  const transactionId = "123";
  const bearerAuth = "Bearer token";

  const fakeTransactionInfo: TransactionInfo = {
    transactionId: "123",
    status: TransactionStatusEnum.NOTIFIED_OK,
    payments: [
      {
        rptId: "ABC1234567890" as any,
        amount: 1000 as any,
        isAllCCP: true,
        transferList: [
          {
            paFiscalCode: "AAAAAA00A00A000A",
            digitalStamp: true,
            transferAmount: 1000 as any,
          },
        ],
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should succeed and return transaction info on status 200", async () => {
    const client = {
      getTransactionInfo: jest.fn().mockResolvedValue(
        E.right({
          status: 200,
          value: fakeTransactionInfo,
        })
      ),
      newTransaction: jest.fn(),
      calculateFees: jest.fn(),
    } as Client;

    const result = await ecommerceTransaction(
      transactionId,
      bearerAuth,
      client
    )();

    expect(result).toEqual(E.right(fakeTransactionInfo));
  });

  it("should fail when response status !== 200", async () => {
    const client = {
      getTransactionInfo: jest.fn().mockResolvedValue(
        E.left({
          status: 502,
        })
      ),
      newTransaction: jest.fn(),
      calculateFees: jest.fn(),
    } as Client;

    const result = await ecommerceTransaction(
      transactionId,
      bearerAuth,
      client
    )();

    expect(result).toEqual(E.left(UNKNOWN.value));
  });

  it("should fail when getTransactionInfo returns Left", async () => {
    const client = {
      getTransactionInfo: jest
        .fn()
        .mockResolvedValue(Promise.resolve(E.left(new Error("API error")))),
      newTransaction: jest.fn(),
      calculateFees: jest.fn(),
    } as Client;
    const result = await ecommerceTransaction(
      transactionId,
      bearerAuth,
      client
    )();

    expect(result).toEqual(E.left(UNKNOWN.value));
  });

  it("should fail when response is Right(Left(error))", async () => {
    const client = {
      getTransactionInfo: jest
        .fn()
        .mockResolvedValue(E.right(E.left(new Error("response logic error")))),
      newTransaction: jest.fn(),
      calculateFees: jest.fn(),
    } as Client;

    const result = await ecommerceTransaction(
      transactionId,
      bearerAuth,
      client
    )();

    expect(result).toEqual(E.left(UNKNOWN.value));
  });

  it("should handle exception thrown by getTransactionInfo and track NET_ERR", async () => {
    const client = {
      getTransactionInfo: jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("network failure"))),
      newTransaction: jest.fn(),
      calculateFees: jest.fn(),
    } as Client;

    const result = await ecommerceTransaction(
      transactionId,
      bearerAuth,
      client
    )();

    expect(result).toEqual(E.left(UNKNOWN.value));
  });
});
