import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { checkLogout } from "../utils/api/helper";
import FindOutMoreModal from "../components/modals/FindOutMoreModal";
import { getUriFragments } from "../utils/regex/urlUtilities";
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
import {
  getDataEntryTypeFromSessionStorage,
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
  getPaymentMethodSelectedFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  eventViewOutcomeMap,
  MixpanelEventCategory,
  MixpanelEventType,
  MixpanelPaymentPhase,
} from "../utils/mixpanel/mixpanelEvents";
import { ROUTE_FRAGMENT } from "./models/routeModel";

type PrintData = {
  useremail: string;
  amount: string;
};

type CartInformation = {
  redirectUrl: string;
  isCart: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function PaymentResponsePageV2() {
  const navigate = useNavigate();

  const {
    transactionId,
    outcome: outcomeFragment,
    totalAmount: totalAmountFragment,
    fees: feesFragment,
  } = getUriFragments(
    ROUTE_FRAGMENT.TRANSACTION_ID,
    ROUTE_FRAGMENT.OUTCOME,
    ROUTE_FRAGMENT.TOTAL_AMOUNT,
    ROUTE_FRAGMENT.FEES
  );

  const outcome = (outcomeFragment ||
    ViewOutcomeEnum.GENERIC_ERROR) as ViewOutcomeEnum;
  const totalAmount = totalAmountFragment
    ? Number.parseInt(totalAmountFragment, 10)
    : undefined;
  const fees = feesFragment ? Number.parseInt(feesFragment, 10) : undefined;

  const conf = getConfigOrThrow();

  const transactionData = getSessionItem(SessionItems.transaction) as
    | NewTransactionResponse
    | undefined;

  const isExpectedTransaction =
    transactionData?.transactionId === transactionId;
  const outcomeMessage = isExpectedTransaction
    ? responseOutcome[outcome]
    : responseOutcome[ViewOutcomeEnum.GENERIC_ERROR];
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

  const email = getSessionItem(SessionItems.useremail) as string | undefined;

  const grandTotalAmount =
    totalAmount != null && fees != null
      ? Number(totalAmount) + Number(fees)
      : null;

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: moneyFormat(grandTotalAmount!),
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

  const checkLogoutAndClearStorage = async () => {
    await checkLogout(() => {
      dispatch(removeLoggedUser());
      clearSessionItem(SessionItems.authToken);
    });
    clearStorage();
  };

  useEffect(() => {
    void checkLogoutAndClearStorage();
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    if (outcomeMessage && outcomeMessage.title) {
      const pageTitle = t(outcomeMessage.title, usefulPrintData);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  }, [outcomeMessage]);

  React.useEffect(() => {
    const eventId = eventViewOutcomeMap[outcome];
    if (!eventId) {
      return;
    }

    const paymentInfo = getPaymentInfoFromSessionStorage();

    const baseProps = {
      EVENT_ID: eventId,
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
      data_entry: getDataEntryTypeFromSessionStorage(),
      payment_phase: MixpanelPaymentPhase.PAGAMENTO,
    };

    const extraProps =
      outcome === ViewOutcomeEnum.SUCCESS
        ? {
            EVENT_CATEGORY: MixpanelEventCategory.UX,
            EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
            payment_method_selected:
              getPaymentMethodSelectedFromSessionStorage(),
            flow: getFlowFromSessionStorage(),
          }
        : {
            EVENT_CATEGORY: MixpanelEventCategory.KO,
          };

    mixpanel.track(eventId, { ...baseProps, ...extraProps });
  }, [outcome]);

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
      </Box>
    </PageContainer>
  );
}
