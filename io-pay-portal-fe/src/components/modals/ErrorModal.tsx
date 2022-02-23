/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/ban-types */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogContent,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  PaymentCategoryResponses,
  PaymentFaultCategory,
  PaymentResponses,
} from "../../utils/errors/errorsModel";
import { ErrorButtons } from "../FormButtons/ErrorButtons";

function ErrorModal(props: {
  error: string;
  open: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}) {
  const { t } = useTranslation();
  const [copy, setCopy] = React.useState(t("clipboard.copy"));

  const isCustom = (error: string) =>
    PaymentResponses[error]?.category === PaymentFaultCategory.CUSTOM;
  const notListed = (error: string) => PaymentResponses[error] === undefined;
  const hasDetail = (error: string) =>
    !!PaymentCategoryResponses[PaymentResponses[error]?.category]?.detail;
  const showDetail = (text: string) => text === "ErrorCodeDescription";

  const getErrorTitle = () => {
    if (isCustom(props.error)) {
      return PaymentResponses[props.error]?.title;
    }
    if (notListed(props.error)) {
      return PaymentCategoryResponses[PaymentFaultCategory.NOTLISTED]?.title;
    }
    return PaymentCategoryResponses[PaymentResponses[props.error]?.category]
      ?.title;
  };
  const getErrorBody = () => {
    if (isCustom(props.error)) {
      return PaymentResponses[props.error]?.body;
    }
    if (notListed(props.error)) {
      return PaymentCategoryResponses[PaymentFaultCategory.NOTLISTED]?.body;
    }
    if (hasDetail(props.error)) {
      return "ErrorCodeDescription";
    }
    return PaymentCategoryResponses[PaymentResponses[props.error]?.category]
      ?.body;
  };

  const title = getErrorTitle() || "GenericError.title";
  const body = getErrorBody() || "GenericError.body";
  const buttonsDetail = notListed(props.error)
    ? PaymentCategoryResponses[PaymentFaultCategory.NOTLISTED]?.buttons
    : PaymentCategoryResponses[PaymentResponses[props.error]?.category]
        ?.buttons;

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
        },
      }}
      fullWidth
      open={props.open}
      onClose={props.onClose}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box>
          <Typography variant="h6" component={"div"} sx={{ mb: 2 }}>
            {t(title)}
          </Typography>
          <Typography variant="body1" component={"div"}>
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
              }}
              action={
                <Tooltip title={copy} onMouseOver={(e) => e.stopPropagation()}>
                  <Button
                    variant="text"
                    onClick={() => {
                      void navigator.clipboard.writeText(props.error);
                      setCopy(t("clipboard.copied"));
                    }}
                    onMouseLeave={() => setCopy(t("clipboard.copy"))}
                  >
                    <ContentCopyIcon sx={{ mr: 1 }} /> {t("clipboard.copy")}
                  </Button>
                </Tooltip>
              }
            >
              <AlertTitle
                sx={{
                  mb: 0,
                }}
              >
                {props.error}
              </AlertTitle>
            </Alert>
          )}
          {!!buttonsDetail && (
            <ErrorButtons
              handleClose={props.onClose}
              buttonsDetail={buttonsDetail}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorModal;
