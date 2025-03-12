import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { logoutUser } from "../utils/api/helper";
import FindOutMoreModal from "../components/modals/FindOutMoreModal";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import { getConfigOrThrow } from "../utils/config/config";
import SurveyLink from "../components/commons/SurveyLink";
import PageContainer from "../components/PageContent/PageContainer";
import { responseOutcome } from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  clearSessionItem,
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

type CartInformation = {
  redirectUrl: string;
  isCart: boolean;
};

export default function PaymentResponsePageV2() {
  const outcome = getFragmentParameter(
    window.location.href,
    ROUTE_FRAGMENT.OUTCOME,
    false
  ) as ViewOutcomeEnum;

  const conf = getConfigOrThrow();

  const outcomeMessage = responseOutcome[outcome];
  const [findOutMoreOpen, setFindOutMoreOpen] = useState<boolean>(false);

  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;

  const getCartReturnUrl = (outcome: ViewOutcomeEnum) =>
    ({
      redirectUrl:
        outcome === ViewOutcomeEnum.SUCCESS
          ? cart?.returnUrls.returnOkUrl || "/"
          : cart?.returnUrls.returnErrorUrl || "/",
      isCart: cart != null,
    } as CartInformation);

  const [cartInformation] = useState<CartInformation>(
    getCartReturnUrl(outcome)
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
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      transactionData?.payments.reduce((sum, { amount }) => sum + amount, 0)
    ) + Number(pspSelected?.taxPayerFee);

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: moneyFormat(totalAmount),
  };

  const dispatch = useAppDispatch();

  const checkLogout = () => {
    pipe(
      SessionItems.authToken,
      O.fromNullable,
      O.fold(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async () => {
          await logoutUser({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onError: () => {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onResponse: () => {},
          });
          dispatch(removeLoggedUser());
          clearSessionItem(SessionItems.authToken);
        }
      )
    );
  };

  useEffect(() => {
    checkLogout();
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    if (outcomeMessage && outcomeMessage.title) {
      const pageTitle = t(outcomeMessage.title, usefulPrintData);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  }, [outcomeMessage]);

  return (
    <PageContainer>
      <FindOutMoreModal
        maxWidth="lg"
        open={findOutMoreOpen}
        onClose={() => {
          setFindOutMoreOpen(false);
        }}
      />
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
          <Box px={8} my={3} sx={{ width: "100%", height: "100%" }}>
            {outcome === ViewOutcomeEnum.REFUNDED && (
              <Button
                variant="contained"
                onClick={() => {
                  setFindOutMoreOpen(true);
                }}
                sx={{
                  width: "100%",
                  minHeight: 45,
                }}
              >
                {t("paymentResponsePage.buttons.findOutMode")}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => {
                window.location.replace(cartInformation.redirectUrl);
              }}
              sx={{
                width: "100%",
                minHeight: 45,
                my: 1,
              }}
            >
              {cartInformation.isCart
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
