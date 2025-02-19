/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import featureFlags from "utils/api/featureFlags";
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
import { evaluateFeatureFlag } from "./../../utils/api/helper";
import SkipToContent from "./SkipToContent";

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
  const ignoreRoutes: Array<string> = [
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

  const onFeatureFlagError = (e: string) => {
    // eslint-disable-next-line no-console
    console.error("Error while getting feature flag", e);
    setSessionItem(SessionItems.enableAuthentication, "false");
    setEnableAuthentication(false);
  };

  const onFeatureFlagSuccess = (data: { enabled: boolean }) => {
    setSessionItem(SessionItems.enableAuthentication, data.enabled.toString());
    setEnableAuthentication(data.enabled);
  };

  const initFeatureFlag = async () => {
    const storedFeatureFlag = getSessionItem(SessionItems.enableAuthentication);

    // avoid asking again if you already have received an answer
    if (!storedFeatureFlag) {
      await evaluateFeatureFlag(
        featureFlags.enableAuthentication,
        onFeatureFlagError,
        onFeatureFlagSuccess
      );
    }
  };

  useEffect(() => {
    void initFeatureFlag();
  }, []);

  return (
    <header>
      <Box p={3} bgcolor={"white"}>
        <Stack
          spacing={0}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
          zIndex="1000"
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

          {(!!PaymentInfo.receiver || !!CartInfo?.paymentNotices) &&
            !ignoreRoutes.includes(currentPath) && (
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
      {enableAuthentication && <Button>Mock login button</Button>}
      <DrawerDetail
        paymentNotices={paymentNotices}
        amountToShow={amountToShow}
        drawstate={drawstate}
        toggleDrawer={() => toggleDrawer(false)}
      />
    </header>
  );
}
