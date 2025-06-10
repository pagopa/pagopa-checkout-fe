import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert, Box, Button, Skeleton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RptId } from "../../generated/definitions/payment-ecommerce/RptId";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { QrCodeReader } from "../components/QrCodeReader/QrCodeReader";
import { PaymentFormFields } from "../features/payment/models/paymentModel";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import { qrCodeValidation } from "../utils/regex/validators";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../utils/mixpanel/mixpanelEvents";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentQrPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [camBlocked, setCamBlocked] = React.useState(false);

  React.useEffect(() => {
    mixpanel.track(MixpanelEventsId.CHK_QRCODE_SCAN_SCREEN, {
      EVENT_ID: MixpanelEventsId.CHK_QRCODE_SCAN_SCREEN,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
    });
  }, []);

  const onError = React.useCallback((m: string) => {
    setError(m);
    setErrorModalOpen(true);
  }, []);

  const onSubmit = React.useCallback(async (notice: PaymentFormFields) => {
    const rptId: RptId = `${notice.cf}${notice.billCode}` as RptId;
    navigate(`/${rptId}`);
  }, []);

  const onScan = React.useCallback(
    (data: string | null) => {
      if (data && !loading) {
        setLoading(true);
        if (!qrCodeValidation(data)) {
          onError(ErrorsType.INVALID_QRCODE);
        } else {
          void onSubmit({
            billCode: data?.split("|")[2] || "",
            cf: data?.split("|")[3] || "",
          });
        }
      }
    },
    [error, loading]
  );

  const reloadPage = () => window.location.reload();

  const getPageBody = React.useCallback(() => {
    if (loading) {
      return <Skeleton variant="rectangular" width="100%" height={600} />;
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
          onScan={onScan}
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
          <Button
            variant="text"
            onClick={() => {
              mixpanel.track(
                MixpanelEventsId.CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY,
                {
                  EVENT_ID:
                    MixpanelEventsId.CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY,
                  EVENT_CATEGORY: MixpanelEventCategory.UX,
                  EVENT_TYPE: MixpanelEventType.ACTION,
                }
              );
              navigate(`/${CheckoutRoutes.INSERISCI_DATI_AVVISO}`);
            }}
          >
            {t("paymentQrPage.navigate")}
            <ArrowForwardIcon
              sx={{ color: "primary.main", ml: 2 }}
              fontSize="small"
            />
          </Button>
        </Box>
      </Box>
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            setLoading(false);
          }}
        />
      )}
    </PageContainer>
  );
}
