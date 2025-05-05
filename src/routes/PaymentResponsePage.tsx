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
import { PAYMENT_OUTCOME_CODE } from "../utils/config/mixpanelDefs";
import { mixpanel } from "../utils/config/mixpanelHelperInit";
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
import FindOutMoreModal from "../components/modals/FindOutMoreModal";

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

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: "", // it will get filled later
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

  const showFinalResult = (outcome: ViewOutcomeEnum) => {
    const message = responseOutcome[outcome];
    const redirectTo =
      outcome === ViewOutcomeEnum.SUCCESS
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
  useEffect(() => {
    dispatch(resetThreshold());

    const _o = getSessionItem(SessionItems.outcome) as
      | ViewOutcomeEnum
      | undefined;
    const _a = getSessionItem(SessionItems.totalAmount) as number | undefined;

    if (_o) {
      mixpanel.track(PAYMENT_OUTCOME_CODE.value, {
        EVENT_ID: PAYMENT_OUTCOME_CODE.value,
        outcome: _o,
      });

      setOutcome(_o);
      usefulPrintData.amount =
        _o === ViewOutcomeEnum.SUCCESS && typeof _a === "number"
          ? moneyFormat(_a)
          : "-";

      showFinalResult(_o);
    } else {
      // nothing to show -> clear
      setLoading(false);
    }

    clearSessionItem(SessionItems.outcome);
    clearSessionItem(SessionItems.totalAmount);
    clearSessionItem(SessionItems.authToken);
    clearStorage();
  }, []);

  useEffect(() => {
    if (outcomeMessage && outcomeMessage.title) {
      const pageTitle = t(outcomeMessage.title, usefulPrintData);
      (document.title as any) = pageTitle + " - pagoPA";
    }
  }, [outcomeMessage]);

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
