import { ViewOutcomeEnum } from "./TransactionResultUtil";

export interface IClosePaymentErrorItem {
  statusCode: string;
  enablingDescriptions?: Array<string>;
  outcome: ViewOutcomeEnum;
}

export const getClosePaymentErrorsMap = () => [
  {
    statusCode: "422",
    enablingDescriptions: ["Node did not receive RPT yet"],
    outcome: ViewOutcomeEnum.REFUND_IMMEDIATELY,
  },
  // this is out of scope, will be used later
  /* {
    statusCode: "422",
    enablingDescriptions: ["Outcome already acquired"],
    outcome: ViewOutcomeEnum.TAKING_CHARGE,
  }, */
  {
    statusCode: "400",
    enablingDescriptions: [
      "Incorrect PSP-brokerPSP-Channel-Payment type configuration",
      "Invalid additionalPaymentInformations",
      "Invalid fee",
      "Invalid idBrokerPSP",
      "Invalid idChannel",
      "Invalid idPSP",
      "Invalid outcome",
      "Invalid payment method",
      "Invalid payment type",
      "Invalid paymentMethod",
      "Invalid paymentTokens",
      "Invalid PSP/Canale for MBD",
      "Invalid request",
      "Invalid timestampOperation",
      "Invalid token number",
      "Invalid token",
      "Invalid totalAmount",
      "Invalid transactionId",
      "Mismatched amount",
      "Unacceptable outcome when token has expired",
      "Wrong channel version",
      "Wrong station version",
    ],
    outcome: ViewOutcomeEnum.REFUND_IMMEDIATELY,
  },
  {
    statusCode: "404",
    enablingDescriptions: [
      "The indicated PSP does not exist",
      "The indicated brokerPSP does not exist",
      "The indicated channel does not exist",
      "Unknown token",
    ],
    outcome: ViewOutcomeEnum.REFUND_IMMEDIATELY,
  },
  {
    statusCode: "5xx",
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
  },
];
