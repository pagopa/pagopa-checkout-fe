/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentCheckData } from "../features/payment/models/paymentModel";
import {
  responseMessage,
  responseOutcome,
} from "../features/payment/models/responseOutcome";
import { getCheckData, getEmailInfo, getWallet } from "../utils/api/apiService";
import { callServices } from "../utils/api/response";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
import { PAYMENT_OUTCOME_CODE } from "../utils/config/mixpanelDefs";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  getOutcomeFromAuthcodeAndIsDirectAcquirer,
  OutcomeEnumType,
  ViewOutcomeEnum,
  ViewOutcomeEnumType,
} from "../utils/transactions/TransactionResultUtil";
import { GENERIC_STATUS } from "../utils/transactions/TransactionStatesTypes";

type printData = {
  useremail: string;
  amount: string;
};

export default function PaymentCheckPage() {
  const [loading, setLoading] = useState(true);
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const originUrlRedirect = sessionStorage.getItem("originUrlRedirect") || "";
  const PaymentCheckData = getCheckData() as PaymentCheckData;
  const wallet = getWallet();
  const email = getEmailInfo();
  const totalAmount =
    PaymentCheckData.amount.amount + wallet.psp.fixedCost.amount;
  const usefulPrintData: printData = {
    useremail: email.email,
    amount: moneyFormat(totalAmount),
  };

  useEffect(() => {
    const handleFinalStatusResult = (
      idStatus: GENERIC_STATUS,
      authorizationCode?: string,
      isDirectAcquirer?: boolean
    ) => {
      const outcome: OutcomeEnumType =
        getOutcomeFromAuthcodeAndIsDirectAcquirer(
          authorizationCode,
          isDirectAcquirer
        );
      mixpanel.track(PAYMENT_OUTCOME_CODE.value, {
        EVENT_ID: PAYMENT_OUTCOME_CODE.value,
        idStatus,
        outcome,
      });
      showFinalResult(outcome);
    };

    const showFinalResult = (outcome: OutcomeEnumType) => {
      const viewOutcome: ViewOutcomeEnum = pipe(
        ViewOutcomeEnumType.decode(outcome),
        E.getOrElse(() => ViewOutcomeEnum.GENERIC_ERROR as ViewOutcomeEnum)
      );
      const message = responseOutcome[viewOutcome];
      setOutcomeMessage(message);
      setLoading(false);
      window.removeEventListener("beforeunload", onBrowserUnload);
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
        {(loading && (
          <Box
            sx={{
              py: 5,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
            aria-live="assertive"
            aria-label={t("ariaLabels.loading")}
          >
            <CircularProgress />
          </Box>
        )) || (
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
                  window.location.replace(originUrlRedirect);
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
