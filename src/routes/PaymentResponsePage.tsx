/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getConfigOrThrow } from "../utils/config/config";
import SurveyLink from "../components/commons/SurveyLink";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import {
  responseMessage,
  responseOutcome,
} from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { callServices } from "../utils/api/response";
import { PAYMENT_OUTCOME_CODE } from "../utils/config/mixpanelDefs";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import {
  getViewOutcomeFromEcommerceResultCode,
  ViewOutcomeEnum,
} from "../utils/transactions/TransactionResultUtil";
import { Cart } from "../features/payment/models/paymentModel";
import {
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum,
} from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { resetThreshold } from "../redux/slices/threshold";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { TransactionStatusEnum } from "../../generated/definitions/payment-ecommerce/TransactionStatus";
import {
  TransactionInfoClosePaymentResultError,
  TransactionInfo,
} from "../../generated/definitions/payment-ecommerce-v2/TransactionInfo";

type PrintData = {
  useremail: string;
  amount: string;
};

export default function PaymentResponsePage() {
  const conf = getConfigOrThrow();
  const [loading, setLoading] = useState(true);
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const [outcome, setOutcome] = useState<ViewOutcomeEnum>();
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const [redirectUrl, setRedirectUrl] = useState<string>(
    cart ? cart.returnUrls.returnOkUrl : "/"
  );
  const transactionData = getSessionItem(SessionItems.transaction) as
    | NewTransactionResponse
    | undefined;
  const pspSelected = getSessionItem(SessionItems.pspSelected) as
    | Bundle
    | undefined;
  const email = getSessionItem(SessionItems.useremail) as string | undefined;
  const totalAmount =
    Number(
      transactionData?.payments
        .map((p) => p.amount)
        .reduce((sum, current) => sum + current, 0)
    ) + Number(pspSelected?.taxPayerFee);

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: moneyFormat(totalAmount),
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetThreshold());

    const handleFinalStatusResult = (
      idStatus?: TransactionStatusEnum,
      closePaymentResultError?: TransactionInfoClosePaymentResultError,
      sendPaymentResultOutcome?: SendPaymentResultOutcomeEnum,
      gateway?: TransactionInfo["gateway"],
      errorCode?: string
    ) => {
      const outcome: ViewOutcomeEnum = getViewOutcomeFromEcommerceResultCode(
        idStatus,
        closePaymentResultError,
        sendPaymentResultOutcome,
        gateway,
        errorCode
      );
      mixpanel.track(PAYMENT_OUTCOME_CODE.value, {
        EVENT_ID: PAYMENT_OUTCOME_CODE.value,
        idStatus,
        outcome,
      });
      setOutcome(outcome);
      showFinalResult(outcome);
    };

    const showFinalResult = (outcome: ViewOutcomeEnum) => {
      const message = responseOutcome[outcome];
      const redirectTo =
        outcome === "0"
          ? cart
            ? cart.returnUrls.returnOkUrl
            : "/"
          : cart
          ? cart.returnUrls.returnErrorUrl
          : "/";
      setOutcomeMessage(message);
      setRedirectUrl(redirectTo || "");
      setLoading(false);
      window.removeEventListener("beforeunload", onBrowserUnload);
      clearStorage();
    };
    void callServices(handleFinalStatusResult);
  }, []);

  useEffect(() => {
    if (outcomeMessage && outcomeMessage.title) {
      const pageTitle = t(outcomeMessage.title);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  }, [outcomeMessage]);

  const { t } = useTranslation();

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 5,
        }}
      >
        {(loading && <CheckoutLoader />) || (
          <Box
            sx={{
              py: 5,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              whiteSpace: "pre-line",
            }}
          >
            <img
              src={outcomeMessage?.icon}
              alt="cancelled"
              style={{ width: "80px", height: "80px" }}
            />
            <Typography
              variant="h6"
              py={3}
              textAlign="center"
              id="responsePageMessageTitle"
            >
              {outcomeMessage ? t(outcomeMessage.title, usefulPrintData) : ""}
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              id="responsePageMessageBody"
            >
              {outcomeMessage && outcomeMessage.body
                ? t(outcomeMessage.body, usefulPrintData)
                : ""}
            </Typography>
            <Box px={8} sx={{ width: "100%", height: "100%" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  window.location.replace(redirectUrl);
                }}
                sx={{
                  width: "100%",
                  minHeight: 45,
                  my: 4,
                }}
              >
                {cart != null
                  ? t("paymentResponsePage.buttons.continue")
                  : t("errorButton.close")}
              </Button>
            </Box>
            {conf.CHECKOUT_SURVEY_SHOW && outcome === ViewOutcomeEnum.SUCCESS && (
              <Box sx={{ width: "100%" }} px={{ xs: 8, sm: 0 }}>
                <SurveyLink />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
