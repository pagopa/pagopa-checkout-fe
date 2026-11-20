import { FaultCodeCategoryEnum as PaymentDuplicated } from "../../../generated/definitions/payment-ecommerce-v2/PaymentDuplicatedStatusFaultPaymentProblemJson";
import { FaultCodeCategoryEnum as PaymentOngoing } from "../../../generated/definitions/payment-ecommerce-v2/PaymentOngoingStatusFaultPaymentProblemJson";
import { FaultCodeCategoryEnum as PaymentExpired } from "../../../generated/definitions/payment-ecommerce-v2/PaymentExpiredStatusFaultPaymentProblemJson";
import { FaultCodeCategoryEnum as PaymentCanceled } from "../../../generated/definitions/payment-ecommerce-v2/PaymentCanceledStatusFaultPaymentProblemJson";
import { FaultCodeCategoryEnum as PaymentUnavailable } from "../../../generated/definitions/payment-ecommerce-v2/ValidationFaultPaymentUnavailableProblemJson";
import { FaultCodeCategoryEnum as PaymentUnknown } from "../../../generated/definitions/payment-ecommerce-v2/ValidationFaultPaymentUnknownProblemJson";
import { FaultCodeCategoryEnum as PaymentDataError } from "../../../generated/definitions/payment-ecommerce-v2/ValidationFaultPaymentDataErrorProblemJson";
import { FaultCodeCategoryEnum as DomainUnknown } from "../../../generated/definitions/payment-ecommerce-v2/PartyConfigurationFaultPaymentProblemJson";
import { FaultCodeCategoryEnum as GenericError } from "../../../generated/definitions/payment-ecommerce-v2/GatewayFaultPaymentProblemJson";

/**
 * Fault code categories of the PagoPA Verifica and Attiva operations: the union
 * of the `faultCodeCategory` enums of the error schemas returned by the
 * newTransaction operation (404, 409, 502, 503).
 */
export type FaultCategoryEnum =
  | PaymentDuplicated
  | PaymentOngoing
  | PaymentExpired
  | PaymentCanceled
  | PaymentUnavailable
  | PaymentUnknown
  | PaymentDataError
  | DomainUnknown
  | GenericError;

export type FaultCategory = `${FaultCategoryEnum}`;

export const FaultCategoryEnum = {
  ...PaymentDuplicated,
  ...PaymentOngoing,
  ...PaymentExpired,
  ...PaymentCanceled,
  ...PaymentUnavailable,
  ...PaymentUnknown,
  ...PaymentDataError,
  ...DomainUnknown,
  ...GenericError,
} as const;
