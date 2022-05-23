/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Link } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CancelPayment } from "../components/modals/CancelPayment";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentChoice } from "../features/payment/components/PaymentChoice/PaymentChoice";
import { getPaymentId } from "../utils/api/apiService";
import { cancelPayment } from "../utils/api/helper";
import { onBrowserUnload } from "../utils/eventListeners";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  const onBrowserBackEvent = (e: any) => {
    e.preventDefault();
    window.history.pushState(null, "", window.location.pathname);
    setCancelModalOpen(true);
  };

  React.useEffect(() => {
    if (getPaymentId().paymentId) {
      window.addEventListener("beforeunload", onBrowserUnload);
      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", onBrowserBackEvent);
      return () => window.removeEventListener("popstate", onBrowserBackEvent);
    }
    return () => {};
  }, []);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onCancelResponse = () => {
    setLoading(false);
    navigate(`/${CheckoutRoutes.ANNULLATO}`);
  };

  const onCancelPaymentSubmit = () => {
    setCancelModalOpen(false);
    setLoading(true);
    void cancelPayment(onError, onCancelResponse);
  };

  return (
    <>
      {loading && <CheckoutLoader />}
      <PageContainer
        title="paymentChoicePage.title"
        description="paymentChoicePage.description"
        link={
          <Link
            href="https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/"
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
          <PaymentChoice />
          <Box py={4} sx={{ width: "100%", height: "100%" }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              style={{
                minWidth: "120px",
                height: "100%",
                minHeight: 45,
              }}
            >
              {t("paymentChoicePage.button")}
            </Button>
          </Box>
        </Box>
        <CancelPayment
          open={cancelModalOpen}
          onCancel={() => setCancelModalOpen(false)}
          onSubmit={onCancelPaymentSubmit}
        />
        {!!error && (
          <ErrorModal
            error={error}
            open={errorModalOpen}
            onClose={() => {
              setErrorModalOpen(false);
            }}
          />
        )}
      </PageContainer>
    </>
  );
}
