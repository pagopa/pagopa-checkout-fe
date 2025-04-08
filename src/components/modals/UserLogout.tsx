import { Typography, Box, Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import InformationModal from "./InformationModal";

export function UserLogout(props: {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();

  return (
    <InformationModal
      open={props.open}
      onClose={props.onCancel}
      maxWidth="sm"
      hideIcon={true}
      style={{ width: "444px" }}
    >
      <Typography
        id="logoutModalTitle"
        variant="h6"
        component={"div"}
        sx={{ pb: 2 }}
      >
        {t("userSession.logoutModal.title")}
      </Typography>
      <Typography
        variant="body1"
        component={"div"}
        sx={{ whiteSpace: "pre-line" }}
        id="logoutModalBody"
      >
        {t("userSession.logoutModal.body")}
      </Typography>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="flex-end"
        sx={{ mt: 3, gap: 2 }}
      >
        <Button
          id="logoutModalCancelButton"
          variant="text"
          onClick={props.onCancel}
        >
          {t("userSession.logoutModal.cancelButton")}
        </Button>
        <Button
          id="logoutModalConfirmButton"
          variant="contained"
          onClick={props.onSubmit}
        >
          {t("userSession.logoutModal.submitButton")}
        </Button>
      </Box>
    </InformationModal>
  );
}
