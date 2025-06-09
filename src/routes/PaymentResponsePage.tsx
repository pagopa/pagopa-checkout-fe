/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
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
import { resetThreshold } from "../redux/slices/threshold";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { checkLogout } from "../utils/api/helper";
import { TransactionOutcomeInfo } from "../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import {
  getDataEntryTypeFromSessionStorage,
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
  getPaymentMethodSelectedFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelPaymentPhase,
} from "../utils/mixpanel/mixpanelEvents";
import FindOutMoreModal from "./../components/modals/FindOutMoreModal";

type PrintData = {
  useremail: string;
  amount: string;
};

type CartInformation = {
  redirectUrl: string;
  isCart: boolean;
};

export default function PaymentResponsePage() {
  const conf = getConfigOrThrow();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [findOutMoreOpen, setFindOutMoreOpen] = useState<boolean>(false);
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const [outcome, setOutcome] = useState<ViewOutcomeEnum>();
  const [outcomeMessage, setOutcomeMessage] = useState<responseMessage>();
  const [cartInformation, setCartInformation] = useState<CartInformation>({
    redirectUrl: cart ? cart.returnUrls.returnOkUrl : "/",
    isCart: cart != null,
  });
  const email = getSessionItem(SessionItems.useremail) as string | undefined;
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: moneyFormat(totalAmount),
  };

  const dispatch = useAppDispatch();

  const performRedirect = () => {
    pipe(
      cart,
      O.fromNullable,
      O.fold(
        () => navigate(cartInformation.redirectUrl, { replace: true }),
        () => window.location.replace(cartInformation.redirectUrl)
      )
    );
  };

  const handleOutcome = (transactionOutcomeInfo?: TransactionOutcomeInfo) => {
    const outcome: ViewOutcomeEnum =
      (transactionOutcomeInfo?.outcome.toString() as ViewOutcomeEnum) ||
      ViewOutcomeEnum.GENERIC_ERROR;

    if (transactionOutcomeInfo) {
      const grandTotal =
        (transactionOutcomeInfo.totalAmount ?? 0) +
        (transactionOutcomeInfo.fees ?? 0);
      setTotalAmount(grandTotal);
    }

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
    setCartInformation({
      redirectUrl: redirectTo,
      isCart: cart != null,
    });
    setLoading(false);
    window.removeEventListener("beforeunload", onBrowserUnload);
  };

  const performCallsAndClearStorage = async () => {
    await callServices(handleOutcome);

    await checkLogout(() => {
      dispatch(removeLoggedUser());
      clearSessionItem(SessionItems.authToken);
    });
    clearStorage();
  };

  useEffect(() => {
    dispatch(resetThreshold());
    void performCallsAndClearStorage();
  }, []);

  useEffect(() => {
    if (outcomeMessage && outcomeMessage.title) {
      const pageTitle = t(outcomeMessage.title, usefulPrintData);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  }, [outcomeMessage]);

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_UX_SUCCESS, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_UX_SUCCESS,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
      payment_method_selected: getPaymentMethodSelectedFromSessionStorage(),
      data_entry: getDataEntryTypeFromSessionStorage(),
      flow: getFlowFromSessionStorage(),
      payment_phase: MixpanelPaymentPhase.PAGAMENTO,
    });
  }, []);

  const { t } = useTranslation();

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
                variant={
                  outcome === ViewOutcomeEnum.REFUNDED ? "text" : "outlined"
                }
                id="closeButton"
                onClick={performRedirect}
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
        )}
      </Box>
    </PageContainer>
  );
}
