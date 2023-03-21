import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";

import {
  getViewOutcomeFromEcommerceResultCode,
  ViewOutcomeEnum,
} from "../transactions/TransactionResultUtil";

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe("TransactionResultUtil", () => {
  it("should return view outcome with ecommerce athorization", async () => {
    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_OK)
    ).toEqual(ViewOutcomeEnum.SUCCESS);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.ACTIVATED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.UNAUTHORIZED)
    ).toEqual(ViewOutcomeEnum.AUTH_ERROR);

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
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CLOSURE_ERROR)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.EXPIRED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(
        TransactionStatusEnum.EXPIRED_NOT_AUTHORIZED
      )
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.CANCELED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.REFUNDED)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);

    expect(
      getViewOutcomeFromEcommerceResultCode(TransactionStatusEnum.NOTIFIED_KO)
    ).toEqual(ViewOutcomeEnum.GENERIC_ERROR);
  });
});
