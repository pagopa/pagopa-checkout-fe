import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { checkLogout } from "../utils/api/helper";
import FindOutMoreModal from "../components/modals/FindOutMoreModal";
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
import { resetThreshold } from "../redux/slices/threshold";

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
  const [outcome, setOutcome] = useState<ViewOutcomeEnum | undefined>();
  const [totalAmount, setTotalAmount] = useState<string>("-");

  const conf = getConfigOrThrow();

  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;

  const getCartReturnUrl = (outcome: ViewOutcomeEnum | undefined) =>
    ({
      redirectUrl:
        outcome === ViewOutcomeEnum.SUCCESS
          ? cart?.returnUrls.returnOkUrl || "/"
          : cart?.returnUrls.returnErrorUrl || "/",
      isCart: cart != null,
    } as CartInformation);
  // initial placeholder, will be populated after reading session
  const [cartInformation, setCartInformation] = useState<CartInformation>(
    getCartReturnUrl(undefined)
  );
  // read outcome / amount set by backend
  useEffect(() => {
    const storedOutcome = getSessionItem(SessionItems.outcome) as
      | ViewOutcomeEnum
      | undefined;
    const storedTotalAmount = getSessionItem(SessionItems.totalAmount) as
      | number
      | undefined;

    setOutcome(storedOutcome);
    if (
      storedOutcome === ViewOutcomeEnum.SUCCESS &&
      storedTotalAmount !== undefined
    ) {
      setTotalAmount(moneyFormat(storedTotalAmount));
    } else {
      setTotalAmount("-");
    }
    // recompute cart return URL now that we know the outcome
    setCartInformation(getCartReturnUrl(storedOutcome));
    clearSessionItem(SessionItems.outcome);
    clearSessionItem(SessionItems.totalAmount);
  }, []);

  const [findOutMoreOpen, setFindOutMoreOpen] = useState<boolean>(false);

  const email = getSessionItem(SessionItems.useremail) as string | undefined;

  const usefulPrintData: PrintData = {
    useremail: email || "",
    amount: totalAmount,
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

  const outcomeMessage = outcome ? responseOutcome[outcome] : undefined;

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
