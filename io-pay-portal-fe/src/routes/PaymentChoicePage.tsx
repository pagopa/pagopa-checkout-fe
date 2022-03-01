/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import InformationModal from "../components/modals/InformationModal";
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
    <CircularProgress />
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
      <InformationModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        maxWidth="sm"
        hideIcon={true}
        style={{ width: "444px" }}
      >
        <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
          {t("paymentCheckPage.modal.cancelTitle")}
        </Typography>
        <Typography
          variant="body1"
          component={"div"}
          sx={{ whiteSpace: "pre-line" }}
        >
          {t("paymentCheckPage.modal.cancelBody")}
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="end"
          sx={{ mt: 3, gap: 2 }}
        >
          <Button variant="text" onClick={() => setCancelModalOpen(false)}>
            {t("paymentCheckPage.modal.cancelButton")}
          </Button>
          <Button variant="contained" onClick={onCancelPaymentSubmit}>
            {t("paymentCheckPage.modal.submitButton")}
          </Button>
        </Box>
      </InformationModal>
    </PageContainer>
  );
}
