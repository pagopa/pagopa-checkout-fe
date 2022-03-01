import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { RptId } from "../../generated/definitions/payment-activations-api/RptId";
import notification from "../assets/images/payment-notice-pagopa.png";
import ErrorModal from "../components/modals/ErrorModal";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentNoticeForm } from "../features/payment/components/PaymentNoticeForm/PaymentNoticeForm";
import {
  PaymentFormFields,
  PaymentInfo,
} from "../features/payment/models/paymentModel";
import { useSmallDevice } from "../hooks/useSmallDevice";
import {
  getNoticeInfo,
  setPaymentInfo,
  setRptId,
} from "../utils/api/apiService";
import { getPaymentInfoTask } from "../utils/api/helper";

export default function PaymentNoticePage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[1];
  const noticeInfo = getNoticeInfo();

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onSubmit = React.useCallback((notice: PaymentFormFields) => {
    const rptId: RptId = `${notice.cf}${notice.billCode}`;
    setLoading(true);

    void getPaymentInfoTask(rptId, "")
      .fold(onError, (paymentInfo) => {
        setPaymentInfo(paymentInfo as PaymentInfo);
        setRptId(notice);
        setLoading(false);
        navigate(`/${currentPath}/summary`);
      })
      .run();
  }, []);

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer
      title="paymentNoticePage.title"
      description="paymentNoticePage.description"
    >
      <a
        href="#"
        style={{ fontWeight: 600, textDecoration: "none" }}
        onClick={() => setModalOpen(true)}
      >
        {t("paymentNoticePage.helpLink")}
      </a>
      <Box sx={{ mt: 6 }}>
        <PaymentNoticeForm
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultValues={noticeInfo}
          loading={loading}
        />
      </Box>

      <InformationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <img
          src={notification}
          alt="facsimile"
          style={useSmallDevice() ? { width: "100%" } : { height: "80vh" }}
        />
      </InformationModal>
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
  );
}
