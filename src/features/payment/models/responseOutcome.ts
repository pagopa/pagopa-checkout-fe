import { ViewOutcomeEnum } from "../../../utils/transactions/TransactionResultUtil";
import ok from "../../../assets/images/response-ok.svg";
import umbrella from "../../../assets/images/response-umbrella.svg";
import ko from "../../../assets/images/response-ko.svg";
import question from "../../../assets/images/response-question.svg";
import timeout from "../../../assets/images/response-timeout.svg";
import unrecognized from "../../../assets/images/response-unrecognized.svg";

export type responseMessage = {
  title: string;
  body?: string;
  icon: string;
  helpButton?: boolean;
};
export const responseOutcome: Record<ViewOutcomeEnum, responseMessage> = {
  0: {
    title: "paymentResponsePage.0.title",
    body: "paymentResponsePage.0.body",
    icon: ok,
  },
  1: {
    title: "paymentResponsePage.1.title",
    body: "paymentResponsePage.1.body",
    icon: umbrella,
  },
  2: {
    title: "paymentResponsePage.2.title",
    body: "paymentResponsePage.2.body",
    icon: ko,
  },
  3: {
    title: "paymentResponsePage.3.title",
    body: "paymentResponsePage.3.body",
    icon: question,
  },
  4: {
    title: "paymentResponsePage.4.title",
    body: "paymentResponsePage.4.body",
    icon: timeout,
  },
  7: {
    title: "paymentResponsePage.7.title",
    body: "paymentResponsePage.7.body",
    icon: unrecognized,
  },
  8: {
    title: "paymentResponsePage.8.title",
    body: "paymentResponsePage.8.body",
    icon: unrecognized,
  },
  10: {
    title: "paymentResponsePage.10.title",
    body: "paymentResponsePage.10.body",
    icon: ko,
  },
  15: {
    title: "paymentResponsePage.15.title",
    body: "paymentResponsePage.15.body",
    icon: timeout,
  },
};
