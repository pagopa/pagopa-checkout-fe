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
  {
    statusCode: "422",
    enablingDescriptions: [],
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
  },
  {
    statusCode: "400",
    outcome: ViewOutcomeEnum.REFUND_IMMEDIATELY,
  },
  {
    statusCode: "404",
    outcome: ViewOutcomeEnum.REFUND_IMMEDIATELY,
  },
  {
    statusCode: "5xx",
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
  },
];
