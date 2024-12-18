import { Box, Button, Link, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import InformationModal from "./InformationModal";

interface IFindOutModeProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "lg";
}

function FindOutMoreModal(props: IFindOutModeProps) {
  const { t } = useTranslation();
  return (
    <InformationModal
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      hideIcon={true}
    >
      <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
        {t("findOutMoreModal.title")}
      </Typography>
      <Box display={"flex"} flexDirection={"column"} gap={"1em"}>
        <div>
          <Typography sx={{ fontWeight: "bold" }}>
            {t("findOutMoreModal.section1Title")}
          </Typography>
          <div>
            <Typography>{t("findOutMoreModal.section1ContentRow1")}</Typography>
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
            <Typography>{t("findOutMoreModal.section2ContentRow1")}</Typography>
            <Typography>{t("findOutMoreModal.section2ContentRow2")}</Typography>
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
      <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="contained" onClick={props.onClose}>
          {t("paymentSummaryPage.buttons.ok")}
        </Button>
      </Box>
    </InformationModal>
  );
}

export default FindOutMoreModal;
