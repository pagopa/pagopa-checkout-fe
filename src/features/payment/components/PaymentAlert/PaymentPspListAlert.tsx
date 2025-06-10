import React from "react";
import { Alert, AlertTitle, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
export function PaymentPspListAlert(props: {
  onClose: () => void;
  titleKey: string;
  bodyKey: string;
}) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="info"
      variant="outlined"
      action={
        <Button size="small" onClick={props.onClose}>
          Chiudi
        </Button>
      }
      sx={{
        alignItems: "center",
      }}
    >
      <React.Fragment key=".0">
        <AlertTitle>{t(props.titleKey)}</AlertTitle>
        {t(props.bodyKey)}
      </React.Fragment>
    </Alert>
  );
}
