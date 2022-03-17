import { Box, Button } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
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
  getReCaptchaKey,
  setPaymentInfo,
  setRptId,
} from "../utils/api/apiService";
import { getPaymentInfoTask } from "../utils/api/helper";

export default function PaymentNoticePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const noticeInfo = getNoticeInfo();
  const currentPath = location.pathname.split("/")[1];

  const ref = React.useRef(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onSubmit = React.useCallback(
    async (notice: PaymentFormFields) => {
      const rptId: RptId = `${notice.cf}${notice.billCode}`;
      setLoading(true);
      const token = await (ref.current as any).executeAsync();

      void pipe(
        getPaymentInfoTask(rptId, token),
        TE.mapLeft((err) => onError(err)),
        TE.map((paymentInfo) => {
          setPaymentInfo(paymentInfo as PaymentInfo);
          setRptId(notice);
          setLoading(false);
          navigate(`/${currentPath}/summary`);
        })
      )();
    },
    [ref]
  );

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer
      title="paymentNoticePage.title"
      description="paymentNoticePage.description"
    >
      <Button
        variant="text"
        onClick={() => setModalOpen(true)}
        sx={{ p: 0 }}
        aria-hidden="true"
        tabIndex={-1}
      >
        {t("paymentNoticePage.helpLink")}
      </Button>
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
      <ErrorModal
        error={error}
        open={errorModalOpen}
        onClose={() => {
          setErrorModalOpen(false);
        }}
      />
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
    </PageContainer>
  );
}
