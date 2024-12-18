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
    outcome: ViewOutcomeEnum.REFUNDED,
  },
  {
    statusCode: "422",
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
  },
  {
    statusCode: "400",
    outcome: ViewOutcomeEnum.REFUNDED,
  },
  {
    statusCode: "404",
    outcome: ViewOutcomeEnum.REFUNDED,
  },
  {
    statusCode: "5xx",
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
  },
];
