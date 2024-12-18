import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface IFindOutModeProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "lg";
}

function FindOutMoreModal(props: IFindOutModeProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Dialog
      maxWidth={props.maxWidth}
      PaperProps={{
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
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component={"div"} sx={{ mb: 2, fontWeight: "bold" }}>
          {t("findOutMoreModal.title")}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Box display={"flex"} flexDirection={"column"} gap={"1em"}>
          <div>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("findOutMoreModal.section1Title")}
            </Typography>
            <div>
              <Typography>
                {t("findOutMoreModal.section1ContentRow1")}
              </Typography>
              <Typography sx={{ display: "inline" }}>
                {t("findOutMoreModal.section1ContentRow2")}
              </Typography>
              <Link
                target="_blank"
                href="https://www.pagopa.gov.it/it/cittadini/dove-pagare/"
              >
                {t("findOutMoreModal.section1ContentRow2Link")}
              </Link>
            </div>
          </div>
          <div>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("findOutMoreModal.section2Title")}
            </Typography>
            <div>
              <Typography>
                {t("findOutMoreModal.section2ContentRow1")}
              </Typography>
              <Typography>
                {t("findOutMoreModal.section2ContentRow2")}
              </Typography>
            </div>
          </div>
          <div>
            <Typography sx={{ fontWeight: "bold" }}>
              {t("findOutMoreModal.section3Title")}
            </Typography>
            <div>
              <Typography sx={{ display: "inline" }}>
                {t("findOutMoreModal.section3ContentRow1")}
              </Typography>
              <Link
                target={"_blank"}
                href={"https://www.pagopa.gov.it/it/assistenza/"}
              >
                {t("findOutMoreModal.section3ContentRow2Link")}
              </Link>
            </div>
          </div>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant={"contained"}
          onClick={() => {
            props.onClose();
          }}
          sx={{
            minHeight: 45,
            my: 4,
          }}
        >
          {t("errorButton.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FindOutMoreModal;
