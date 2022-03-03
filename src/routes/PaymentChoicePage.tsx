/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CancelPayment } from "../components/modals/CancelPayment";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentChoice } from "../features/payment/components/PaymentChoice/PaymentChoice";
import { setCheckData as setData } from "../redux/slices/checkData";
import {
  getCheckData,
  getPaymentId,
  setCheckData,
} from "../utils/api/apiService";
import { cancelPayment, getPaymentCheckData } from "../utils/api/helper";
import { onBrowserUnload } from "../utils/eventListeners";

export default function PaymentChoicePage() {
  const { t } = useTranslation();
  const currentPath = location.pathname.split("/")[1];
  const [loading, setLoading] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const paymentId = getPaymentId();
  const checkData = getCheckData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onError = () => {
    setLoading(false);
  };

  const onCancelResponse = () => {
    setLoading(false);
    navigate(`/${currentPath}/cancelled`);
  };

  const onCancelPaymentSubmit = () => {
    setCancelModalOpen(false);
    setLoading(true);
    void cancelPayment(onError, onCancelResponse);
  };

  const onBrowserBackEvent = (e: any) => {
    e.preventDefault();
    setCancelModalOpen(true);
  };

  React.useEffect(() => {
    if (!checkData.idPayment) {
      setLoading(true);
      void getPaymentCheckData({
        idPayment: paymentId.paymentId,
        onError: () => setLoading(false), // handle error on response,
        onResponse: (r) => {
          setCheckData(r);
          dispatch(setData(r));
          setLoading(false);
        },
        onNavigate: () => {}, // navigate to ko page,
      });
    }
    window.addEventListener("beforeunload", onBrowserUnload);
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", onBrowserBackEvent);
    return () => window.removeEventListener("popstate", onBrowserBackEvent);
  }, [checkData.idPayment]);

  return loading ? (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      my={30}
    >
      <CircularProgress />
    </Box>
  ) : (
    <PageContainer
      title="paymentChoicePage.title"
      description="paymentChoicePage.description"
      link={
        <a
          href="https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 600, textDecoration: "none" }}
        >
          {t("paymentChoicePage.costs")}
        </a>
      }
    >
      <Box sx={{ mt: 6 }}>
        <PaymentChoice />
      </Box>
      <CancelPayment
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onSubmit={onCancelPaymentSubmit}
      />
    </PageContainer>
  );
}
