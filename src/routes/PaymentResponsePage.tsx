import { Box, Button, Typography } from "@mui/material";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ecommerceIOClientWithPolling } from "../utils/api/client";
import { ecommerceIOTransaction } from "../utils/api/transactions/io";
import {
  ViewOutcomeEnum,
  getOnboardingPaymentOutcome,
  getViewOutcomeFromEcommerceResultCode,
} from "../utils/api/transactions/TransactionResultUtil";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import {
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum,
} from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionStatusEnum } from "../../generated/definitions/payment-ecommerce/TransactionStatus";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import SurveyLink from "../components/commons/SurveyLink";
import { Cart } from "../features/payment/models/paymentModel";
import {
  responseMessage,
  responseOutcome,
} from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { resetThreshold } from "../redux/slices/threshold";
import { callServices } from "../utils/api/response";
import { getConfigOrThrow } from "../utils/config/config";
import { PAYMENT_OUTCOME_CODE } from "../utils/config/mixpanelDefs";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import { getFragments } from "../utils/regex/urlUtilities";
import {
  SessionItems,
  clearStorage,
  getSessionItem,
} from "../utils/storage/sessionStorage";
import { CLIENT_TYPE, ROUTE_FRAGMENT } from "./models/routeModel";

type PrintData = {
  useremail: string;
  amount: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function PaymentResponsePage() {
  const conf = getConfigOrThrow();
  const [loading, setLoading] = useState(true);
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const [outcome, setOutcome] = useState<ViewOutcomeEnum>();
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const [redirectUrl, setRedirectUrl] = useState<string>(
    cart ? cart.returnUrls.returnOkUrl : "/"
  );

  const dispatch = useAppDispatch();

  const config = getConfigOrThrow();

  const getPrintData = (): PrintData => {
    const transactionData = getSessionItem(SessionItems.transaction) as
      | NewTransactionResponse
      | undefined;
    const pspSelected = getSessionItem(SessionItems.pspSelected) as
      | Bundle
      | undefined;
    const email = getSessionItem(SessionItems.useremail) as string | undefined;

    const paymentAmount = Number(
      transactionData?.payments
        .map((p) => p.amount as number)
        .reduce((sum: number, current: number) => sum + current, 0)
    );

    const taxPayerFee = Number(pspSelected?.taxPayerFee);
    const totalAmount = paymentAmount + taxPayerFee;

    return {
      useremail: email || "",
      amount: moneyFormat(totalAmount),
    };
  };

  const usefulPrintData = getPrintData();

  const redirectToClient = (transactionId: string, outcome: ViewOutcomeEnum) =>
    window.location.replace(
      `${config.CHECKOUT_CONFIG_WEBVIEW_PM_HOST}${config.CHECKOUT_TRANSACTION_BASEPATH}/${transactionId}/outcomes?outcome=${outcome}`
    );

  const showFinalResult = (outcome: ViewOutcomeEnum) => {
    const message = responseOutcome[outcome];
    const returnUrls = cart?.returnUrls;
    const redirectTo =
      outcome === "0"
        ? returnUrls?.returnOkUrl || "/"
        : returnUrls?.returnErrorUrl || "/";

    setOutcomeMessage(message);
    setRedirectUrl(redirectTo);
    setLoading(false);

    // cleanup
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();
  };

  const handleFinalStatusResult = (
    idStatus?: TransactionStatusEnum,
    sendPaymentResultOutcome?: SendPaymentResultOutcomeEnum,
    gateway?: string,
    errorCode?: string
  ) => {
    const outcome: ViewOutcomeEnum = getViewOutcomeFromEcommerceResultCode(
      idStatus,
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

  const { clientId, transactionId } = getFragments(
    ROUTE_FRAGMENT.CLIENT_ID,
    ROUTE_FRAGMENT.TRANSACTION_ID
  );

  const appClientPolling = async () => {
    const sessionToken = getSessionItem(SessionItems.sessionToken) as
      | string
      | undefined;
    if (sessionToken && clientId && transactionId) {
      pipe(
        await ecommerceIOTransaction(
          transactionId,
          sessionToken,
          ecommerceIOClientWithPolling
        ),
        O.match(
          () => redirectToClient(transactionId, ViewOutcomeEnum.GENERIC_ERROR),
          (transactionInfo) => {
            const outcome = getOnboardingPaymentOutcome(transactionInfo.status);
            redirectToClient(transactionId, outcome);
          }
        )
      );
    }
  };

  useEffect(() => {
    if (clientId === CLIENT_TYPE.IO) {
      void appClientPolling();
    }
  }, [clientId, transactionId]);

  useEffect(() => {
    if (!clientId) {
      dispatch(resetThreshold());

      void callServices(handleFinalStatusResult);
    }
  }, []);

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
                  height: "100%",
                  minHeight: 45,
                  my: 4,
                }}
              >
                {t("errorButton.close")}
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
