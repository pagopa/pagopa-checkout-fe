/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/ban-types */
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React from "react";
import { useTranslation } from "react-i18next";

function InformationModal(props: {
  open: boolean;
  onClose: () => void;
  id?: string;
  hideIcon?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  maxWidth?: "xs" | "sm" | "lg";
  titleId?: string;
  title?: string;
  ctaId?: string;
  bodyId?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
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
          bgcolor: theme.palette.background.default,
        },
      }}
      fullWidth
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle sx={{ m: 0, p: 4 }}>
        {props.title && (
          <Typography
            id={props.titleId}
            variant="h6"
            component={"div"}
            sx={{ mb: 2 }}
          >
            {props.title}
          </Typography>
        )}
        {!props.hideIcon && (
          <IconButton
            aria-label={t("ariaLabels.close")}
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
      <DialogContent sx={{ p: 4 }}>{props.children}</DialogContent>
    </Dialog>
  );
}

InformationModal.defaultProps = {
  maxWidth: "lg",
};

export default InformationModal;
