import { Box } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CancelPayment } from "../components/modals/CancelPayment";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
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
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentEmailPage() {
  const navigate = useNavigate();
  const emailInfo = getEmailInfo();

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
    navigate(`/${CheckoutRoutes.ANNULLATO}`);
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
    navigate(`/${CheckoutRoutes.SCEGLI_METODO}`);
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
        onNavigate: () => navigate(`/${CheckoutRoutes.ERRORE}`),
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
        <CheckoutLoader />
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
