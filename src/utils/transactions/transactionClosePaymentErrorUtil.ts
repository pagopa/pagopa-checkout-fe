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
