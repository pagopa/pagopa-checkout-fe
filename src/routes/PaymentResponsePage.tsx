/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import {
  responseMessage,
  responseOutcome,
} from "../features/payment/models/responseOutcome";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import SurveyLink from "../components/commons/SurveyLink";
import { useAppDispatch } from "../redux/hooks/hooks";
import { callServices, pollTransaction } from "../utils/api/response";
import {
  PAYMENT_OUTCOME_CODE,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
} from "../utils/config/mixpanelDefs";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import {
  getOnboardingPaymentOutcome,
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
import { getFragments } from "../utils/regex/urlUtilities";
import { getConfigOrThrow } from "../utils/config/config";
import { CLIENT_TYPE, ROUTE_FRAGMENT } from "./models/routeModel";

type printData = {
  useremail: string;
  amount: string;
};

export default function PaymentResponsePage() {
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

  const usefulPrintData: printData = {
    useremail: email || "",
    amount: moneyFormat(totalAmount),
  };

  const dispatch = useAppDispatch();

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
    if (sessionToken) {
      pipe(
        await pollTransaction(transactionId, sessionToken),
        O.match(
          () => handleFinalStatusResult(),
          (transactionInfo) => {
            const outcome = getOnboardingPaymentOutcome(transactionInfo.status);
            window.location.replace(
              `${getConfigOrThrow().CHECKOUT_CONFIG_WEBVIEW_PM_HOST}${
                getConfigOrThrow().CHECKOUT_TRANSACTION_BASEPATH
              }/${transactionId}/outcomes?outcome=${outcome}`
            );
          }
        )
      );
    }
  };

  useEffect(() => {
    if (clientId === CLIENT_TYPE.IO) {
      void appClientPolling();
    }
  }, [clientId]);

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
            {outcome === ViewOutcomeEnum.SUCCESS && (
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
