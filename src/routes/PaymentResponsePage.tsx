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
import { resetSecurityCode } from "../redux/slices/securityCode";
import { resetCardData } from "../redux/slices/cardData";
import {
  getEmailInfo,
  getPspSelected,
  getReturnUrls,
  getTransaction,
} from "../utils/api/apiService";
import { callServices } from "../utils/api/response";
import { PAYMENT_OUTCOME_CODE } from "../utils/config/mixpanelDefs";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import { clearSensitiveItems } from "../utils/storage/sessionStorage";
import {
  getViewOutcomeFromEcommerceResultCode,
  ViewOutcomeEnum,
} from "../utils/transactions/TransactionResultUtil";
import { TransactionStatusEnum } from "../../generated/definitions/payment-ecommerce/TransactionStatus";

type printData = {
  useremail: string;
  amount: string;
};

export default function PaymentCheckPage() {
  const [loading, setLoading] = useState(true);
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const [redirectUrl, setRedirectUrl] = useState<string>(
    getReturnUrls().returnOkUrl
  );
  const transactionData = getTransaction();
  const pspSelected = getPspSelected();
  const email = getEmailInfo();
  const totalAmount =
    Number(
      transactionData.payments
        .map((p) => p.amount)
        .reduce((sum, current) => sum + current, 0)
    ) + Number(pspSelected.fee);

  const usefulPrintData: printData = {
    useremail: email.email,
    amount: moneyFormat(totalAmount),
  };
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetSecurityCode());
    dispatch(resetCardData());
    const handleFinalStatusResult = (idStatus?: TransactionStatusEnum) => {
      const outcome: ViewOutcomeEnum =
        getViewOutcomeFromEcommerceResultCode(idStatus);
      mixpanel.track(PAYMENT_OUTCOME_CODE.value, {
        EVENT_ID: PAYMENT_OUTCOME_CODE.value,
        idStatus,
        outcome,
      });
      showFinalResult(outcome);
    };

    const showFinalResult = (outcome: ViewOutcomeEnum) => {
      const message = responseOutcome[outcome];
      const redirectTo =
        outcome === "0"
          ? getReturnUrls().returnOkUrl
          : getReturnUrls().returnErrorUrl;
      setOutcomeMessage(message);
      setRedirectUrl(redirectTo);
      setLoading(false);
      window.removeEventListener("beforeunload", onBrowserUnload);
      clearSensitiveItems();
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
                  sessionStorage.clear();
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
