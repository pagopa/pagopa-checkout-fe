/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Link } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as B from "fp-ts/boolean";
import { WalletType } from "features/payment/models/walletModel";
import { CancelPayment } from "../components/modals/CancelPayment";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentChoice } from "../features/payment/components/PaymentChoice/PaymentChoice";
import {
  Cart,
  PaymentInfo,
  PaymentInstrumentsType,
} from "../features/payment/models/paymentModel";
import { getPaymentInstruments } from "../utils/api/helper";
import { getTotalFromCart } from "../utils/cart/cart";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../utils/mixpanel/mixpanelEvents";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const amount =
    (getSessionItem(SessionItems.paymentInfo) as PaymentInfo | undefined)
      ?.amount ||
    (cart && getTotalFromCart(cart)) ||
    0;
  const [loading, setLoading] = React.useState(false);
  const [instrumentsLoading, setInstrumentsLoading] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [paymentInstruments, setPaymentInstruments] = React.useState<
    Array<PaymentInstrumentsType>
  >([]);

  const getPaymentMethods = async () => {
    setInstrumentsLoading(true);
    await getPaymentInstruments({ amount }, onError, onResponse);
  };

  React.useEffect(() => {
    if (!paymentInstruments?.length) {
      void getPaymentMethods();
    }
  }, []);

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_METHOD_SELECTION, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_METHOD_SELECTION,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      flow: getFlowFromSessionStorage(),
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });
  }, []);

  const onResponse = (list: Array<PaymentInstrumentsType>) => {
    setPaymentInstruments(list);
    setInstrumentsLoading(false);
  };

  const onError = React.useCallback((m: string) => {
    pipe(
      m !== ErrorsType.UNAUTHORIZED,
      B.fold(
        () => {
          setSessionItem(
            SessionItems.loginOriginPage,
            `${location.pathname}${location.search}`
          );
          navigate(`/${CheckoutRoutes.AUTH_EXPIRED}`);
        },
        () => {
          setLoading(false);
          setError(m);
          setErrorModalOpen(true);
        }
      )
    );
  }, []);

  const onCancelResponse = React.useCallback(() => {
    setLoading(false);
    navigate(`/${CheckoutRoutes.ANNULLATO}`);
  }, []);

  const onCancelPaymentSubmit = React.useCallback(() => {
    setCancelModalOpen(false);
    setLoading(true);
    onCancelResponse();
  }, []);

  const handleBackNavigate = React.useCallback(() => navigate(-1), []);

  const handleCloseModal = React.useCallback(
    () => setCancelModalOpen(false),
    []
  );
  const handleCloseErrorModal = React.useCallback(
    () => setErrorModalOpen(false),
    []
  );
  const handleRetry = React.useCallback(getPaymentMethods, []);
  const wallets: Array<WalletType> = [
    {
      walletId: "63cd1a15-8ce0-45a5-b5fa-6ee141ef8314",
      userId: "05b47118-ac54-4324-90f0-59a784972184",
      paymentMethodId: "9d735400-9450-4f7e-9431-8c1e7fa2a339",
      status: "VALIDATED",
      creationDate: "2025-04-02T13:39:48.504628907Z",
      updateDate: "2025-04-02T13:40:14.388197423Z",
      applications: [
        {
          name: "PAGOPA",
          status: "ENABLED",
        },
      ],
      clients: {
        IO: {
          status: "ENABLED",
        },
      },
      details: {
        type: "PAYPAL",
        pspId: "BCITITMM",
        pspBusinessName: "Intesa Sanpaolo S.p.A",
        maskedEmail: "b***@icbpi.it",
      },
      paymentMethodAsset:
        "https://assets.cdn.platform.pagopa.it/apm/paypal.png",
    },
    {
      walletId: "6540b667-4035-4ca5-915b-1e1c7b5b9b94",
      userId: "05b47118-ac54-4324-90f0-59a784972184",
      paymentMethodId: "f25399bf-c56f-4bd2-adc9-7aef87410609",
      status: "VALIDATED",
      creationDate: "2025-06-17T13:12:25.061900455Z",
      updateDate: "2025-06-17T13:13:09.098212127Z",
      applications: [
        {
          name: "PAGOPA",
          status: "ENABLED",
        },
      ],
      clients: {
        IO: {
          status: "ENABLED",
        },
      },
      details: {
        type: "CARDS",
        lastFourDigits: "0014",
        expiryDate: "203012",
        brand: "MASTERCARD",
      },
      paymentMethodAsset:
        "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
    },
    {
      walletId: "27222721-174c-453d-a745-d4892a4d0f22",
      userId: "05b47118-ac54-4324-90f0-59a784972184",
      paymentMethodId: "0d1450f4-b993-4f89-af5a-1770a45f5d71",
      status: "VALIDATED",
      creationDate: "2025-10-10T11:26:04.998280346Z",
      updateDate: "2025-10-10T11:26:37.198178097Z",
      applications: [
        {
          name: "PAGOPA",
          status: "ENABLED",
        },
      ],
      clients: {
        IO: {
          status: "ENABLED",
        },
      },
      details: {
        type: "PAYPAL",
        pspId: "BCITITMM",
        pspBusinessName: "Intesa Sanpaolo S.p.A",
        maskedEmail: "b@icbpi.it",
      },
      paymentMethodAsset:
        "https://assets.cdn.platform.pagopa.it/apm/paypal.png",
    },
  ];

  return (
    <>
      {loading && <CheckoutLoader />}
      <PageContainer
        title="paymentChoicePage.title"
        description="paymentChoicePage.description"
        link={
          <Link
            href={`https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/?amount=${amount}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
            title={t("paymentChoicePage.costs")}
          >
            {t("paymentChoicePage.costs")}
          </Link>
        }
      >
        <Box sx={{ mt: 6 }}>
          <PaymentChoice
            amount={amount}
            paymentInstruments={paymentInstruments}
            loading={instrumentsLoading}
            wallets={wallets}
          />
          <Box py={4} sx={{ width: "100%", height: "100%" }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleBackNavigate}
              style={{
                minWidth: "120px",
                height: "100%",
                minHeight: 45,
              }}
              disabled={instrumentsLoading}
            >
              {t("paymentChoicePage.button")}
            </Button>
          </Box>
        </Box>
        <CancelPayment
          open={cancelModalOpen}
          onCancel={handleCloseModal}
          onSubmit={onCancelPaymentSubmit}
        />
        {!!error && (
          <ErrorModal
            error={error}
            open={errorModalOpen}
            onClose={handleCloseErrorModal}
            onRetry={handleRetry}
          />
        )}
      </PageContainer>
    </>
  );
}
