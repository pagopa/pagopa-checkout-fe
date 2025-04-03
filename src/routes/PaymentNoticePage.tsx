import { Box, Button } from "@mui/material";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { RptId } from "../../generated/definitions/payment-ecommerce/RptId";
import notification from "../assets/images/payment-notice-pagopa.png";
import ErrorModal from "../components/modals/ErrorModal";
import InformationModal from "../components/modals/InformationModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentNoticeForm } from "../features/payment/components/PaymentNoticeForm/PaymentNoticeForm";
import { PaymentFormFields } from "../features/payment/models/paymentModel";
import { useSmallDevice } from "../hooks/useSmallDevice";
import { getEcommercePaymentInfoTask } from "../utils/api/helper";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentNoticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rptid } = useParams();
  const noticeInfo = getSessionItem(SessionItems.noticeInfo) as
    | PaymentFormFields
    | undefined;

  const ref = React.useRef<typeof ReCAPTCHA>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onError = (
    faultCodeCategory: string,
    faultCodeDetail: string | undefined
  ) => {
    // 401 on secured api means session is expired
    if (
      faultCodeCategory === "SESSION_EXPIRED" &&
      faultCodeDetail === "Unauthorized"
    ) {
      navigate(`/${CheckoutRoutes.AUTH_EXPIRED}`);
      return;
    }

    setLoading(false);
    setError(`${faultCodeCategory}-${faultCodeDetail}`);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onSubmit = React.useCallback(
    async (notice: PaymentFormFields) => {
      const rptId: RptId = `${notice.cf}${notice.billCode}` as RptId;
      setLoading(true);
      const token = await ref.current?.executeAsync();

      await pipe(
        getEcommercePaymentInfoTask(rptId, token || ""),
        TE.mapLeft((err) =>
          onError(err.faultCodeCategory, err.faultCodeDetail)
        ),
        TE.map((paymentInfo) => {
          setSessionItem(SessionItems.paymentInfo, paymentInfo);
          setSessionItem(SessionItems.noticeInfo, notice);
          navigate(
            `/${CheckoutRoutes.DATI_PAGAMENTO}`,
            rptid ? { replace: true } : {}
          );
        })
      )();
    },
    [ref]
  );

  const onCancel = () => {
    navigate(-1);
  };

  React.useEffect(() => {
    if (rptid) {
      void onSubmit({
        billCode: rptid?.slice(11) || "",
        cf: rptid?.slice(0, 11) || "",
      });
    }
  }, [rptid]);

  return (
    <>
      {rptid && loading && <CheckoutLoader />}
      <PageContainer
        title="paymentNoticePage.title"
        description="paymentNoticePage.description"
      >
        <Button variant="text" onClick={() => setModalOpen(true)} sx={{ p: 0 }}>
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
          title={t("paymentNoticePage.exampleModalTitle")}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        >
          <img
            src={notification}
            alt={t("paymentNoticePage.exampleModalAltText")}
            style={useSmallDevice() ? { width: "100%" } : { height: "80vh" }}
          />
        </InformationModal>
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
          titleId="verifyPaymentTitleError"
          bodyId="verifyPaymentBodyError"
          errorId="verifyPaymentErrorId"
        />
      </PageContainer>
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
