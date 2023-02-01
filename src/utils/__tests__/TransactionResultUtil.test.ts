import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";

import {
  EcommerceFinalStatusCodeEnum,
  getOutcomeFromEcommerceAuthCode,
} from "../transactions/TransactionResultUtil";

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe("TransactionResultUtil", () => {
  it("should return Outcome with AuthorizationCode VPos", async () => {
    expect(
      getOutcomeFromEcommerceAuthCode(TransactionStatusEnum.NOTIFIED)
    ).toEqual(EcommerceFinalStatusCodeEnum.NOTIFIED);

    expect(
      getOutcomeFromEcommerceAuthCode(TransactionStatusEnum.NOTIFIED_FAILED)
    ).toEqual(EcommerceFinalStatusCodeEnum.GENERIC_ERROR);
  });
});
