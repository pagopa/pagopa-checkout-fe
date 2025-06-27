/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import pagopaLogo from "../../assets/images/pagopa-logo.svg";
import {
  Cart,
  PaymentInfo,
  PaymentNotice,
} from "../../features/payment/models/paymentModel";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";
import { getTotalFromCart } from "../../utils/cart/cart";
import { moneyFormat } from "../../utils/form/formatters";
import { paymentSubjectTransform } from "../../utils/transformers/paymentTransformers";
import DrawerDetail from "../Header/DrawerDetail";
import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import SkipToContent from "./SkipToContent";
import LoginHeader from "./LoginHeader";

function amountToShow() {
  const cartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  return (
    (cartInfo && cartInfo.paymentNotices && getTotalFromCart(cartInfo)) ||
    paymentInfo?.amount ||
    0
  );
}

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const paymentInfoData = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  const PaymentInfo = {
    receiver: paymentInfoData?.paName || "",
    subject: paymentSubjectTransform(paymentInfoData?.description) || "",
    amount: paymentInfoData?.amount || 0,
  };
  const CartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const [drawstate, setDrawstate] = React.useState(false);
  const [enableAuthentication, setEnableAuthentication] = React.useState(
    getSessionItem(SessionItems.enableAuthentication) === "true"
  );
  const ignoredRoutesForSummaryButton: Array<string> = [
    CheckoutRoutes.ROOT,
    CheckoutRoutes.LEGGI_CODICE_QR,
    CheckoutRoutes.INSERISCI_DATI_AVVISO,
    CheckoutRoutes.DATI_PAGAMENTO,
    CheckoutRoutes.ANNULLATO,
    CheckoutRoutes.ERRORE,
    CheckoutRoutes.SESSIONE_SCADUTA,
    CheckoutRoutes.ESITO,
    CheckoutRoutes.DONA,
  ];
  const enablePaymentSummaryButton =
    (!!PaymentInfo.receiver || !!CartInfo?.paymentNotices) &&
    !ignoredRoutesForSummaryButton.includes(currentPath);
  const hidePaymentHeaderPages: Array<string> = [
    CheckoutRoutes.AUTH_CALLBACK,
    CheckoutRoutes.AUTH_EXPIRED,
  ];
  const hidePaymentHeader = hidePaymentHeaderPages.includes(currentPath);
  const toggleDrawer = (open: boolean) => {
    setDrawstate(open);
  };
  const paymentNotices: Array<PaymentNotice> = CartInfo
    ? CartInfo.paymentNotices
    : [
        {
          noticeNumber: paymentInfoData?.rptId
            ? paymentInfoData?.rptId.slice(11)
            : "",
          creditorReferenceId: paymentInfoData?.creditorReferenceId,
          fiscalCode: paymentInfoData?.paFiscalCode || "",
          amount: paymentInfoData?.amount || 0,
          companyName: paymentInfoData?.paName || "",
          description: paymentInfoData?.description || "",
        },
      ];

  const { checkFeatureFlag } = useFeatureFlags();

  const initFeatureFlag = async () => {
    try {
      await Promise.all([
        checkFeatureFlag({
          flagName: "enableAuthentication",
          sessionKey: SessionItems.enableAuthentication,
          onSuccess: setEnableAuthentication,
          onError: () => setEnableAuthentication(false),
        }),
        checkFeatureFlag({
          flagName: "enableMaintenance",
          sessionKey: SessionItems.enableMaintenance,
          onSuccess: (enabled: boolean) => {
            if (enabled) {
              setEnableAuthentication(false);
            }
          },
          onError: () => {
            setSessionItem(SessionItems.enableMaintenance, "false");
          },
        }),
      ]);
    } finally {
      setLoadingFlags(false); // Even if it fails, complete the loading state
    }
  };

  useEffect(() => {
    void initFeatureFlag();
  }, []);

  // Prevents initial UI render before feature flags are loaded,
  // avoiding flicker when MaintenancePage should be shown.
  const [loadingFlags, setLoadingFlags] = React.useState(true);

  if (loadingFlags) {
    return null;
  }

  return (
    <header>
      <Stack position="relative" zIndex="1000">
        {enableAuthentication && <LoginHeader />}
        {!hidePaymentHeader && (
          <Box p={3}>
            <Stack
              spacing={0}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack
                spacing={4}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                position="relative"
              >
                <img
                  src={pagopaLogo}
                  alt="pagoPA"
                  style={{ width: "56px", height: "36px" }}
                  aria-hidden="true"
                />
                <SkipToContent />
              </Stack>
              {enablePaymentSummaryButton && (
                <Button
                  onClick={() => toggleDrawer(true)}
                  aria-label={t("mainPage.header.detail.detailButton")}
                  endIcon={<ShoppingCart />}
                >
                  {moneyFormat(amountToShow())}
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
      <DrawerDetail
        paymentNotices={paymentNotices}
        amountToShow={amountToShow}
        drawstate={drawstate}
        toggleDrawer={() => toggleDrawer(false)}
      />
    </header>
  );
}
