import {
  PaymentCodeTypeEnum,
  PaymentInstrumentsType,
} from "../../features/payment/models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { PaymentMethodManagementTypeEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodManagementType";

export function getPaymentMethodsMock(): Array<PaymentInstrumentsType> {
  return [
    {
      id: "card-id",
      name: "CARDS",
      description: "Carte di Credito e Debito",
      status: PaymentMethodStatusEnum.ENABLED,
      methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
      paymentTypeCode: PaymentCodeTypeEnum.CP,
      ranges: [],
    },
    {
      id: "bancomatpay-id",
      name: "BANCOMATPAY",
      description: "BancomatPay",
      status: PaymentMethodStatusEnum.ENABLED,
      methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
      paymentTypeCode: PaymentCodeTypeEnum.BPAY,
      ranges: [],
    },
  ];
}
