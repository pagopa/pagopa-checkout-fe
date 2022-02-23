/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/ban-types */
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { t } from "i18next";
import React from "react";

function InformationModal(props: {
  open: boolean;
  onClose: () => void;
  content?: "default" | "alternative";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  maxWidth?: "xs" | "sm" | "lg";
}) {
  return (
    <Dialog
      maxWidth={props.maxWidth}
      PaperProps={{
        style: {
          ...props.style,
        },
        sx: {
          width: "auto",
          borderRadius: 1,
        },
      }}
      fullWidth
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {props.content === "default" && (
          <IconButton
            aria-label="close"
            onClick={() => props.onClose()}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "action.active",
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        {props.children}
        {props.content === "alternative" && (
          <Box display="flex" justifyContent="end" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={props.onClose}>
              {t("errorButton.close")}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

InformationModal.defaultProps = {
  maxWidth: "lg",
  content: "default",
};

export default InformationModal;
