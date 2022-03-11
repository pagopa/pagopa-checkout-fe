import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { RptId } from "../../generated/definitions/payment-activations-api/RptId";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { QrCodeReader } from "../components/QrCodeReader/QrCodeReader";
import {
  PaymentFormFields,
  PaymentInfo,
} from "../features/payment/models/paymentModel";
import {
  getReCaptchaKey,
  setPaymentInfo,
  setRptId,
} from "../utils/api/apiService";
import { getPaymentInfoTask } from "../utils/api/helper";
import { qrCodeValidation } from "../utils/regex/validators";
import { ErrorsType } from "../utils/errors/checkErrorsModel";

export default function PaymentQrPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[1];
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [camBlocked, setCamBlocked] = React.useState(false);
  const ref = React.useRef(null);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onSubmit = React.useCallback(async (notice: PaymentFormFields) => {
    const rptId: RptId = `${notice.cf}${notice.billCode}`;
    setLoading(true);
    const token = await (ref.current as any).executeAsync();

    void pipe(
      getPaymentInfoTask(rptId, token),
      TE.mapLeft((err) => onError(err)),
      TE.map((paymentInfo) => {
        setPaymentInfo(paymentInfo as PaymentInfo);
        setRptId(notice);
        navigate(`/${currentPath}/summary`);
      })
    )();
  }, []);

  const reloadPage = () => window.location.reload();

  const getPageBody = React.useCallback(() => {
    if (loading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          my={10}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (camBlocked) {
      return (
        <Alert
          severity="warning"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            mt: 2,
          }}
        >
          <Box
            sx={{
              whiteSpace: "break-spaces",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {t("paymentQrPage.camBlocked")}
            <Button
              variant="text"
              onClick={reloadPage}
              sx={{ mt: 1, p: 0, alignSelf: "start" }}
            >
              {t("paymentQrPage.reloadPage")}
            </Button>
          </Box>
        </Alert>
      );
    } else {
      return (
        <QrCodeReader
          onError={() => setCamBlocked(true)}
          onScan={(data) => {
            if (data && !loading) {
              if (!qrCodeValidation(data)) {
                onError(ErrorsType.INVALID_QRCODE);
              } else {
                void onSubmit({
                  billCode: data?.split("|")[2] || "",
                  cf: data?.split("|")[3] || "",
                });
              }
            }
          }}
          enableLoadFromPicture={false}
        />
      );
    }
  }, [loading, camBlocked]);

  return (
    <PageContainer
      title="paymentQrPage.title"
      description="paymentQrPage.description"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ gap: 2 }}
      >
        <Box sx={{ my: 2, width: "100%" }}>{getPageBody()}</Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ gap: 2, mb: 4 }}
        >
          <a
            href=""
            style={{ fontWeight: 600, textDecoration: "none" }}
            onClick={() => navigate(`/${currentPath}/notice`)}
          >
            {t("paymentQrPage.navigate")}
          </a>
          <ArrowForwardIcon sx={{ color: "primary.main" }} fontSize="small" />
        </Box>
      </Box>
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
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
