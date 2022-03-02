/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import PageContainer from "../components/PageContent/PageContainer";
import {
  OutcomeEnumType,
  ViewOutcomeEnum,
  ViewOutcomeEnumType,
  getOutcomeFromAuthcodeAndIsDirectAcquirer,
} from "../utils/transactions/TransactionResultUtil";

import { callServices } from "../utils/api/response";

import {
  mixpanel,
  PAYMENT_OUTCOME_CODE,
} from "../utils/config/pmMixpanelHelperInit";

import { GENERIC_STATUS } from "../utils/transactions/TransactionStatesTypes";
import { loadState, SessionItems } from "../utils/storage/sessionStorage";

import {
  responseOutcome,
  responseMessage,
} from "../features/payment/models/responseOutcome";

import { PaymentCheckData } from "../features/payment/models/paymentModel";

import { moneyFormat } from "../utils/form/formatters";

type printData = {
  useremail: string;
  amount: string;
};

export default function PaymentCheckPage() {
  const [loading, setLoading] = useState(true);
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const originUrlRedirect = sessionStorage.getItem("originUrlRedirect") || "";
  const PaymentCheckData = loadState(
    SessionItems.checkData
  ) as PaymentCheckData;
  const usefulPrintData: printData = {
    useremail: JSON.parse(sessionStorage.getItem("useremail") || ""),
    amount: moneyFormat(PaymentCheckData.amount.amount) || "",
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
      const viewOutcome: ViewOutcomeEnum = ViewOutcomeEnumType.decode(
        outcome
      ).getOrElse(ViewOutcomeEnum.GENERIC_ERROR);
      const message = responseOutcome[viewOutcome];
      setOutcomeMessage(message);
      setLoading(false);
      sessionStorage.clear();
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
            }}
          >
            <Typography variant="h6" py={3} textAlign="center">
              {outcomeMessage ? t(outcomeMessage.title, usefulPrintData) : ""}
            </Typography>
            <Typography variant="body1" textAlign="center">
              {outcomeMessage && outcomeMessage.body
                ? t(outcomeMessage.body, usefulPrintData)
                : ""}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => window.location.replace(originUrlRedirect)}
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
        )}
      </Box>
    </PageContainer>
  );
}
