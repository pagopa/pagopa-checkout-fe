/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import {
  responseMessage,
  responseOutcome,
} from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { resetCardData } from "../redux/slices/cardData";
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
import { TransactionStatusEnum } from "../../generated/definitions/payment-ecommerce/TransactionStatus";
import { Cart } from "../features/payment/models/paymentModel";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { resetThreshold } from "../redux/slices/threshold";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { TransactionInfo } from "../../generated/definitions/payment-ecommerce/TransactionInfo";

type printData = {
  useremail: string;
  amount: string;
};

export default function PaymentResponsePage() {
  const [loading, setLoading] = useState(true);
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
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

  const errorCode = transactionData?.errorCode;
  const authorizationCode = transactionData?.authorizationCode;
  const paymentGateway = transactionData?.gateway;
  const authorizationResult = transactionData?.authorizationResult;

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetCardData());
    dispatch(resetThreshold());

    const handleFinalStatusResult = (
      transactionData?: NewTransactionResponse
    ) => {
      const outcome: ViewOutcomeEnum =
        getViewOutcomeFromEcommerceResultCode(transactionData);
      mixpanel.track(PAYMENT_OUTCOME_CODE.value, {
        EVENT_ID: PAYMENT_OUTCOME_CODE.value,
        idStatus: transactionData?.status,
        outcome,
      });
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
            <Typography variant="h6" py={3} textAlign="center">
              {outcomeMessage ? t(outcomeMessage.title, usefulPrintData) : ""}
            </Typography>
            <Typography variant="body1" textAlign="center">
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
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}
