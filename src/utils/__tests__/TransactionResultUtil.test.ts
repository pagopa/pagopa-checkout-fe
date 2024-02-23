import { SendPaymentResultOutcomeEnum } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";

import {
  getViewOutcomeFromEcommerceResultCode,
  NpgAuthorizationStatus,
  PaymentGateway,
  ViewOutcomeEnum,
} from "../transactions/TransactionResultUtil";

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe("TransactionResultUtil", () => {
  it("should return view outcome with ecommerce athorization", async () => {
    // check success when status is NOTIFIED_OK
    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_OK)
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    // check success when status is NOTIFICATION_ERROR and sendPaymentResultOutcome OK
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_ERROR,
        SendPaymentResultOutcomeEnum.OK
      )
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    // check success when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome OK
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED,
        SendPaymentResultOutcomeEnum.OK
      )
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    // check GENERIC_ERROR when status is NOTIFICATION_ERROR and sendPaymentResultOutcome undefined
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_ERROR
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    // check GENERIC_ERROR when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome undefined
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    // check GENERIC_ERROR when status is NOTIFICATION_ERROR and sendPaymentResultOutcome KO
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_ERROR,
        SendPaymentResultOutcomeEnum.KO
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    // check GENERIC_ERROR when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome KO
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED,
        SendPaymentResultOutcomeEnum.KO
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_KO)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUNDED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.REFUND_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUND_ERROR)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSURE_ERROR)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CANCELLATION_EXPIRED
      )
    ).toEqual(ViewOutcomeEnum.CANCELED_BY_USER);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CANCELED)
    ).toEqual(ViewOutcomeEnum.CANCELED_BY_USER);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.AUTHORIZATION_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.AUTHORIZATION_COMPLETED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSED,
        SendPaymentResultOutcomeEnum.NOT_RECEIVED
      )
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSED,
        SendPaymentResultOutcomeEnum.OK
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSED,
        SendPaymentResultOutcomeEnum.KO
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSURE_ERROR)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.EXPIRED_NOT_AUTHORIZED
      )
    ).toEqual(ViewOutcomeEnum.TIMEOUT);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CANCELED)
    ).toEqual(ViewOutcomeEnum.CANCELED_BY_USER);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUNDED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_KO)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    // Check EXPIRED cases !wasAuthRequested !sendPaymentResultOK
    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.EXPIRED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);
  });

  expect(
    getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.UNAUTHORIZED)
  ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

  // NPG
  // SUCCESS(0)
  it("should return correct SUCCESS(0) outcome with NPG gateway", async () => {
    [
      TransactionStatusEnum.NOTIFICATION_REQUESTED,
      TransactionStatusEnum.NOTIFICATION_ERROR,
      TransactionStatusEnum.NOTIFIED_OK,
      TransactionStatusEnum.EXPIRED,
    ].forEach((transactionStatus) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          transactionStatus,
          SendPaymentResultOutcomeEnum.OK,
          PaymentGateway.NPG,
          undefined,
          NpgAuthorizationStatus.EXECUTED
        )
      ).toEqual(ViewOutcomeEnum.SUCCESS);
    });
  });

  // GENERIC_ERROR(1)
  it("should return correctly GENERIC_ERROR(1) outcome with NPG gateway", async () => {
    // Testing dinamically on NpgAuthorizationStatus
    [
      NpgAuthorizationStatus.AUTHORIZED,
      NpgAuthorizationStatus.PENDING,
      NpgAuthorizationStatus.VOIDED,
      NpgAuthorizationStatus.REFUNDED,
      NpgAuthorizationStatus.FAILED,
    ].forEach((npgAuthorizationStatus) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          undefined,
          npgAuthorizationStatus
        )
      ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);
    });

    // Testing dinamically on errorCode when NpgAuthorizationStatus is declined
    [
      "109",
      "115",
      "904",
      "906",
      "907",
      "908",
      "909",
      "911",
      "913",
      "999",
    ].forEach((errorCode) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          errorCode,
          NpgAuthorizationStatus.DECLINED
        )
      ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);
    });
  });

  // AUTH_ERROR(2)
  it("should return correctly AUTH_ERROR(2) outcome with NPG gateway", async () => {
    // Testing dinamically on NpgAuthorizationStatus
    [
      NpgAuthorizationStatus.DENIED_BY_RISK,
      NpgAuthorizationStatus.THREEDS_VALIDATED,
      NpgAuthorizationStatus.THREEDS_FAILED,
    ].forEach((npgAuthorizationStatus) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          undefined,
          npgAuthorizationStatus
        )
      ).toEqual(ViewOutcomeEnum.AUTH_ERROR);
    });

    // Testing dinamically on errorCode when NpgAuthorizationStatus is declined
    [
      "100",
      "102",
      "106",
      "116",
      "117",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "126",
      "129",
      "200",
      "202",
      "204",
      "413",
      "888",
      "902",
      "903",
    ].forEach((errorCode) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          errorCode,
          NpgAuthorizationStatus.DECLINED
        )
      ).toEqual(ViewOutcomeEnum.AUTH_ERROR);
    });
  });

  // INVALID_DATA(3)
  it("should return correctly INVALID_DATA(3) outcome with NPG gateway", async () => {
    // Testing dinamically on errorCode when NpgAuthorizationStatus is declined
    ["104", "110", "118", "125", "208", "209", "210"].forEach((errorCode) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          errorCode,
          NpgAuthorizationStatus.DECLINED
        )
      ).toEqual(ViewOutcomeEnum.INVALID_DATA);
    });
  });

  // INVALID_CARD(7)
  it("should return correctly INVALID_CARD(7) outcome with NPG gateway", async () => {
    // Testing dinamically on errorCode when NpgAuthorizationStatus is declined
    ["101", "111"].forEach((errorCode) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(
          TransactionStatusEnum.UNAUTHORIZED,
          undefined,
          PaymentGateway.NPG,
          errorCode,
          NpgAuthorizationStatus.DECLINED
        )
      ).toEqual(ViewOutcomeEnum.INVALID_CARD);
    });
  });

  // CANCELED_BY_USER(8)
  it("should return correctly CANCELED_BY_USER(8) outcome with NPG gateway", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.UNAUTHORIZED,
        undefined,
        PaymentGateway.NPG,
        undefined,
        NpgAuthorizationStatus.CANCELED
      )
    ).toEqual(ViewOutcomeEnum.CANCELED_BY_USER);
  });
});
