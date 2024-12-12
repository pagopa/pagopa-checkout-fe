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
        {
          sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
        }
      )
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    // check success when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome OK
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED,
        {
          sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
        }
      )
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    // check PSP_ERROR when status is NOTIFICATION_ERROR and sendPaymentResultOutcome undefined
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_ERROR
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    // check PSP_ERROR when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome undefined
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    // check PSP_ERROR when status is NOTIFICATION_ERROR and sendPaymentResultOutcome KO
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_ERROR,
        {
          sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.KO,
        }
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    // check PSP_ERROR when status is NOTIFICATION_REQUESTED and sendPaymentResultOutcome KO
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.NOTIFICATION_REQUESTED,
        {
          sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.KO,
        }
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_KO)
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUNDED)
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.REFUND_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUND_ERROR)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSURE_ERROR,
        undefined,
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: undefined,
        }
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

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
        TransactionStatusEnum.AUTHORIZATION_COMPLETED,
        undefined,
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: undefined,
        }
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSED, {
        sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.NOT_RECEIVED,
      })
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.AUTHORIZATION_REQUESTED
      )
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSED, {
        sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
      })
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSED, {
        sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.KO,
      })
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
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_KO)
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);

    // Check EXPIRED cases !wasAuthRequested !sendPaymentResultOK
    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.EXPIRED)
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.UNAUTHORIZED,
        undefined,
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: undefined,
        }
      )
    ).toEqual(ViewOutcomeEnum.PSP_ERROR);
  });

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
          {
            sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
          },
          {
            gateway: PaymentGateway.NPG,
            authorizationStatus: NpgAuthorizationStatus.EXECUTED,
          }
        )
      ).toEqual(ViewOutcomeEnum.SUCCESS);
    });
  });

  // GENERIC_ERRER(1)
  it("should return correctly GENERIC_ERRER(1) outcome with NPG gateway", async () => {
    [
      TransactionStatusEnum.AUTHORIZATION_COMPLETED,
      TransactionStatusEnum.CLOSURE_ERROR,
    ].forEach((transactionStatus) => {
      expect(
        getViewOutcomeFromEcommerceResultCode(transactionStatus, undefined, {
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.EXECUTED,
        })
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
          {
            gateway: PaymentGateway.NPG,
            authorizationStatus: npgAuthorizationStatus,
          }
        )
      ).toEqual(ViewOutcomeEnum.AUTH_ERROR);
    });

    // Testing dinamically on errorCode when NpgAuthorizationStatus is declined
    [
      "100",
      "102",
      "106",
      "119",
      "120",
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
          {
            errorCode,
            gateway: PaymentGateway.NPG,
            authorizationStatus: NpgAuthorizationStatus.DECLINED,
          }
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
          {
            errorCode,
            gateway: PaymentGateway.NPG,
            authorizationStatus: NpgAuthorizationStatus.DECLINED,
          }
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
          {
            errorCode,
            gateway: PaymentGateway.NPG,
            authorizationStatus: NpgAuthorizationStatus.DECLINED,
          }
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
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.CANCELED,
        }
      )
    ).toEqual(ViewOutcomeEnum.CANCELED_BY_USER);
  });

  // TAKING_CHARGE(17)
  it("should return correctly TAKING_CHARGE(17) outcome with NPG gateway", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.EXPIRED,
        undefined,
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: undefined,
        }
      )
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSED,
        {
          sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.NOT_RECEIVED,
        },
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.EXECUTED,
        }
      )
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.CLOSURE_REQUESTED,
        undefined,
        {
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.EXECUTED,
        }
      )
    ).toEqual(ViewOutcomeEnum.TAKING_CHARGE);
  });

  // PSP_ERROR(25)
  it("should return correctly PSP_ERROR(25) outcome with NPG gateway", async () => {
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
          {
            gateway: PaymentGateway.NPG,
            authorizationStatus: npgAuthorizationStatus,
          }
        )
      ).toEqual(ViewOutcomeEnum.PSP_ERROR);
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
          {
            errorCode,
            gateway: PaymentGateway.NPG,
            authorizationStatus: NpgAuthorizationStatus.DECLINED,
          }
        )
      ).toEqual(ViewOutcomeEnum.PSP_ERROR);
    });
  });

  // BALANCE_LIMIT(116)
  it("should return correctly BALANCE_LIMIT(116) outcome with NPG gateway", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.UNAUTHORIZED,
        undefined,
        {
          errorCode: "116",
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.DECLINED,
        }
      )
    ).toEqual(ViewOutcomeEnum.BALANCE_LIMIT);
  });

  // CVV_ERROR(117)
  it("should return correctly CVV_ERROR(117) outcome with NPG gateway", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.UNAUTHORIZED,
        undefined,
        {
          errorCode: "117",
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.DECLINED,
        }
      )
    ).toEqual(ViewOutcomeEnum.CVV_ERROR);
  });

  // LIMIT_EXCEEDED(121)
  it("should return correctly LIMIT_EXCEEDED(121) outcome with NPG gateway", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.UNAUTHORIZED,
        undefined,
        {
          errorCode: "121",
          gateway: PaymentGateway.NPG,
          authorizationStatus: NpgAuthorizationStatus.DECLINED,
        }
      )
    ).toEqual(ViewOutcomeEnum.LIMIT_EXCEEDED);
  });
});
