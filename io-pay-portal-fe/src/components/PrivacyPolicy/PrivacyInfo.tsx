import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import InformationModal from "../modals/InformationModal";
import PrivacyPolicy from "./PrivacyPolicy";

export default function PrivacyInfo() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Box mt={4}>
        <Typography variant="caption" component={"div"}>
          {t("privacyInfo.privacyDesc")}
          <a
            href="#"
            style={{ fontWeight: 600, textDecoration: "none" }}
            onClick={() => setModalOpen(true)}
          >
            {t("privacyInfo.privacy")}
          </a>
          <br />
          {`${t("privacyInfo.googleDesc")} (`}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.privacyPolicy")}
          </a>
          {` ${t("general.and")} `}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.serviceTerms")}
          </a>
          {")."}
        </Typography>
      </Box>
      <InformationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <PrivacyPolicy />
      </InformationModal>
    </>
  );
}
