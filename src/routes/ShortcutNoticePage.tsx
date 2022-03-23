import { Box, Button, CircularProgress } from "@mui/material";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
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
  getReCaptchaKey,
  setPaymentInfo,
  setRptId,
} from "../utils/api/apiService";
import { getPaymentInfoTask } from "../utils/api/helper";

export default function ShortcutNoticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rptid } = useParams();

  const ref = React.useRef(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onSubmit = React.useCallback(
    async (notice: PaymentFormFields) => {
      const rptId: RptId = `${notice.cf}${notice.billCode}`;
      const token = await (ref.current as any).executeAsync();

      void pipe(
        getPaymentInfoTask(rptId, token),
        TE.mapLeft((err) => onError(err)),
        TE.map((paymentInfo) => {
          setPaymentInfo(paymentInfo as PaymentInfo);
          setRptId(notice);
          navigate("/payment/summary", { replace: true });
        })
      )();
    },
    [ref]
  );

  const onCancel = () => {
    navigate(-1);
  };

  React.useEffect(() => {
    void onSubmit({
      billCode: rptid?.slice(11) || "",
      cf: rptid?.slice(0, 11) || "",
    });
  }, []);

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
              defaultValues={{
                billCode: rptid?.slice(11) || "",
                cf: rptid?.slice(0, 11) || "",
              }}
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
        </PageContainer>
      )}
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
    </>
  );
}
