/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/ban-types */
import CopyAllIcon from "@mui/icons-material/CopyAll";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ErrorsType } from "../../utils/errors/checkErrorsModel";
import { PaymentCategoryResponses } from "../../utils/errors/errorsModel";
import { ErrorButtons } from "../FormButtons/ErrorButtons";
import { FaultCategoryEnum } from "../../../generated/definitions/payment-ecommerce/FaultCategory";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelPaymentPhase,
} from "../../utils/mixpanel/mixpanelEvents";
import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../../utils/mixpanel/mixpanelTracker";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";

function ErrorModal(props: {
  error: string;
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  style?: React.CSSProperties;
  titleId?: string;
  errorId?: string;
  bodyId?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [copy, setCopy] = React.useState(t("clipboard.copy"));

  const notListed = (faultCategory: string) =>
    PaymentCategoryResponses[
      faultCategory as keyof typeof FaultCategoryEnum
    ] === undefined;
  const hasDetail = (faultCategory: string) =>
    !!PaymentCategoryResponses[faultCategory as keyof typeof FaultCategoryEnum]
      ?.detail;
  const showDetail = (text: string) => text === "ErrorCodeDescription";

  // error for Node verify & activation
  const nodeFaultCode: Array<string> = props.error.split("-");
  const nodeFaultCodeCategory =
    nodeFaultCode[0] as keyof typeof FaultCategoryEnum;
  const nodeFaultCodeDetails =
    nodeFaultCode.length === 2 ? nodeFaultCode[1] : "";

  const getErrorTitle = () =>
    PaymentCategoryResponses[nodeFaultCodeCategory]?.title;
  const getErrorBody = () => {
    if (notListed(nodeFaultCodeCategory)) {
      return PaymentCategoryResponses[FaultCategoryEnum.GENERIC_ERROR]?.body;
    }
    if (hasDetail(nodeFaultCodeCategory)) {
      return "ErrorCodeDescription";
    }
    return PaymentCategoryResponses[nodeFaultCodeCategory]?.body;
  };

  const getErrorButtons = () => {
    if (notListed(nodeFaultCodeCategory)) {
      return PaymentCategoryResponses[FaultCategoryEnum.GENERIC_ERROR]?.buttons;
    }
    return PaymentCategoryResponses[nodeFaultCodeCategory]?.buttons;
  };

  const title = getErrorTitle() || "GENERIC_ERROR.title";
  const body = getErrorBody() || "GENERIC_ERROR.body";
  const buttons = getErrorButtons();
  const buttonsDetail =
    props.error === ErrorsType.STATUS_ERROR ||
    props.error === ErrorsType.TIMEOUT
      ? buttons?.map((elem, index) =>
          index === 1 ? { ...elem, action: props.onRetry } : elem
        )
      : buttons;
  const showProgressBar = props.error === ErrorsType.POLLING_SLOW;

  React.useEffect(() => {
    if (props.open && nodeFaultCodeCategory) {
      const eventMap: Partial<Record<FaultCategoryEnum, string>> = {
        [FaultCategoryEnum.PAYMENT_DUPLICATED]:
          MixpanelEventsId.PAYMENT_DUPLICATED,
        [FaultCategoryEnum.PAYMENT_ONGOING]: MixpanelEventsId.PAYMENT_ONGOING,
        [FaultCategoryEnum.PAYMENT_EXPIRED]: MixpanelEventsId.PAYMENT_EXPIRED,
        [FaultCategoryEnum.PAYMENT_UNAVAILABLE]:
          MixpanelEventsId.PAYMENT_UNAVAILABLE,
        [FaultCategoryEnum.PAYMENT_UNKNOWN]: MixpanelEventsId.PAYMENT_UNKNOWN,
        [FaultCategoryEnum.DOMAIN_UNKNOWN]: MixpanelEventsId.DOMAIN_UNKNOWN,
        [FaultCategoryEnum.PAYMENT_CANCELED]: MixpanelEventsId.PAYMENT_CANCELED,
        [FaultCategoryEnum.GENERIC_ERROR]: MixpanelEventsId.PAYMENT_UNKNOWN,
        [FaultCategoryEnum.PAYMENT_DATA_ERROR]:
          MixpanelEventsId.PAYMENT_DATA_ERROR,
      };

      const eventId = eventMap[nodeFaultCodeCategory as FaultCategoryEnum];
      if (eventId) {
        const paymentInfo = getPaymentInfoFromSessionStorage();
        mixpanel.track(eventId, {
          EVENT_ID: eventId,
          EVENT_CATEGORY: MixpanelEventCategory.KO,
          reason: nodeFaultCodeDetails ? nodeFaultCodeDetails : null,
          data_entry: getDataEntryTypeFromSessionStorage(),
          organization_name: paymentInfo?.paName,
          organization_fiscal_code: paymentInfo?.paFiscalCode,
          amount: paymentInfo?.amount,
          expiration_date: paymentInfo?.dueDate,
          payment_phase: MixpanelPaymentPhase.VERIFICA,
        });
      }
    }
  }, [props.open, nodeFaultCodeCategory, nodeFaultCodeDetails]);

  return (
    <Dialog
      PaperProps={{
        style: {
          ...props.style,
        },
        sx: {
          width: "600px",
          borderRadius: 1,
          p: 4,
          background: theme.palette.background.default,
        },
      }}
      fullWidth
      open={props.open}
      onClose={props.onClose}
      aria-live="assertive"
    >
      <DialogTitle sx={{ p: 0 }}>
        <Typography
          id={props.titleId}
          variant="h6"
          component={"div"}
          sx={{ mb: 2 }}
        >
          {t(title)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Typography id={props.bodyId} variant="body1" component={"div"}>
          {t(body)}
        </Typography>
        {showDetail(body) && (
          <Alert
            severity="info"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              mt: 2,
              borderLeftColor: theme.palette.info.main + " !important",
              borderLeft: "4px solid",
            }}
            action={
              <Tooltip
                title={copy as any}
                onMouseOver={(e) => e.stopPropagation()}
              >
                <Button
                  variant="text"
                  onClick={() => {
                    void navigator.clipboard.writeText(nodeFaultCodeDetails);
                    setCopy(t("clipboard.copied"));
                  }}
                  onMouseLeave={() => setCopy(t("clipboard.copy"))}
                >
                  <CopyAllIcon
                    sx={{
                      mr: 1,
                    }}
                  />
                  {t("clipboard.copy")}
                </Button>
              </Tooltip>
            }
          >
            <AlertTitle
              id={props.errorId}
              sx={{
                mb: 0,
              }}
            >
              {nodeFaultCodeDetails}
            </AlertTitle>
          </Alert>
        )}
        {showProgressBar ? (
          <LinearProgress sx={{ my: 2 }} />
        ) : (
          !!buttonsDetail && (
            <ErrorButtons
              handleClose={props.onClose}
              buttonsDetail={buttonsDetail}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ErrorModal;
