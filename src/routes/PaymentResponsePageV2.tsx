import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import { getConfigOrThrow } from "../utils/config/config";
import SurveyLink from "../components/commons/SurveyLink";
import PageContainer from "../components/PageContent/PageContainer";
import { responseOutcome } from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { ViewOutcomeEnum } from "../utils/transactions/TransactionResultUtil";
import { Cart } from "../features/payment/models/paymentModel";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { resetThreshold } from "../redux/slices/threshold";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { ROUTE_FRAGMENT } from "./models/routeModel";

type PrintData = {
  useremail: string;
  amount: string;
};

export default function PaymentResponsePageV2() {
  const outcome = getFragmentParameter(
    window.location.href,
    ROUTE_FRAGMENT.OUTCOME,
    false
  ) as ViewOutcomeEnum;

  const conf = getConfigOrThrow();

  const outcomeMessage = responseOutcome[outcome];

  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;

  const redirectUrl =
    outcome === ViewOutcomeEnum.SUCCESS
      ? cart?.returnUrls.returnOkUrl || "/"
      : cart?.returnUrls.returnErrorUrl || "/";

  const transactionData = getSessionItem(SessionItems.transaction) as
    | NewTransactionResponse
    | undefined;

  const pspSelected = getSessionItem(SessionItems.pspSelected) as
    | Bundle
    | undefined;

  const email = getSessionItem(SessionItems.useremail) as string | undefined;

  const totalAmount =
    Number(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      transactionData?.payments.reduce((sum, { amount }) => sum + amount, 0)
    ) + Number(pspSelected?.taxPayerFee);

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: moneyFormat(totalAmount),
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();
  }, []);

  const { t } = useTranslation();

  useEffect(()=>{
    if(outcomeMessage && outcomeMessage.title){
      const pageTitle = t(outcomeMessage.title);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  },[outcomeMessage])

  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 5,
        }}
      >
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
      </Box>
    </PageContainer>
  );
}
