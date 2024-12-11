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

const FindOutMoreModal = (props: IFindOutModeProps) => {
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
        <Typography variant="h6" component={"div"} sx={{ mb: 2 }}>
          {t("findOutMoreModal.title")}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="body2" component={"div"} sx={{ mb: 2 }}>
          <Box display={"flex"} flexDirection={"column"} gap={"1em"}>
            <div>
              <strong> {t("findOutMoreModal.section1Title")}</strong>
              <div>
                <div>{t("findOutMoreModal.section1ContentRow1")}</div>
                <span> {t("findOutMoreModal.section1ContentRow2")}</span>
                <Link
                  target="_blank"
                  href="https://www.pagopa.gov.it/it/prestatori-servizi-di-pagamento/elenco-PSP-attivi/"
                >
                  {t("findOutMoreModal.section1ContentRow2Link")}
                </Link>
              </div>
            </div>
            <div>
              <strong> {t("findOutMoreModal.section2Title")}</strong>
              <div>
                <div>{t("findOutMoreModal.section2ContentRow1")}</div>
                <div>{t("findOutMoreModal.section2ContentRow2")}</div>
              </div>
            </div>
            <div>
              <strong> {t("findOutMoreModal.section3Title")}</strong>
              <div>
                <span>{t("findOutMoreModal.section3ContentRow1")}</span>
                <Link
                  target={"_blank"}
                  href={"https://www.pagopa.gov.it/it/assistenza/"}
                >
                  {t("findOutMoreModal.section3ContentRow2Link")}
                </Link>
              </div>
            </div>
          </Box>
        </Typography>
      </DialogContent>
      <DialogActions>
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
};

FindOutMoreModal.defaultProps = {
  maxWidth: "lg",
};

export default FindOutMoreModal;
