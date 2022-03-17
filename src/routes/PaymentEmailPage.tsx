import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CancelPayment } from "../components/modals/CancelPayment";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentEmailForm } from "../features/payment/components/PaymentEmailForm/PaymentEmailForm";
import { PaymentEmailFormFields } from "../features/payment/models/paymentModel";
import { setCheckData as setData } from "../redux/slices/checkData";
import {
  getCheckData,
  getEmailInfo,
  getPaymentId,
  setCheckData,
  setEmailInfo,
} from "../utils/api/apiService";
import { cancelPayment, getPaymentCheckData } from "../utils/api/helper";
import { onBrowserUnload } from "../utils/eventListeners";

export default function PaymentEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const emailInfo = getEmailInfo();
  const currentPath = location.pathname.split("/")[1];

  const paymentId = getPaymentId();
  const checkData = getCheckData();
  const dispatch = useDispatch();
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  const onBrowserBackEvent = (e: any) => {
    e.preventDefault();
    setCancelModalOpen(true);
  };

  const onCancelResponse = () => {
    setLoading(false);
    navigate(`/${currentPath}/cancelled`);
  };

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onCancelPaymentSubmit = () => {
    setCancelModalOpen(false);
    setLoading(true);
    void cancelPayment(onError, onCancelResponse);
  };

  const onSubmit = React.useCallback((emailInfo: PaymentEmailFormFields) => {
    setEmailInfo(emailInfo);
    navigate(`/${currentPath}/paymentchoice`);
  }, []);

  const onCancel = () => setCancelModalOpen(false);

  React.useEffect(() => {
    if (!checkData.idPayment) {
      setLoading(true);
      void getPaymentCheckData({
        idPayment: paymentId.paymentId,
        onError,
        onResponse: (r) => {
          setCheckData(r);
          dispatch(setData(r));
          setLoading(false);
        },
        onNavigate: () => navigate(`/${currentPath}/ko`),
      });
    }
    window.addEventListener("beforeunload", onBrowserUnload);
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", onBrowserBackEvent);
    return () => window.removeEventListener("popstate", onBrowserBackEvent);
  }, [checkData.idPayment]);

  return (
    <>
      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          my={10}
          aria-live="assertive"
          aria-label={t("ariaLabels.loading")}
        >
          <CircularProgress />
        </Box>
      ) : (
        <PageContainer
          title="paymentEmailPage.title"
          description="paymentEmailPage.description"
        >
          <Box sx={{ mt: 6 }}>
            <PaymentEmailForm
              onCancel={() => setCancelModalOpen(true)}
              onSubmit={onSubmit}
              defaultValues={emailInfo}
            />
          </Box>
          <CancelPayment
            open={cancelModalOpen}
            onCancel={onCancel}
            onSubmit={onCancelPaymentSubmit}
          />
        </PageContainer>
      )}
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
    </>
  );
}
