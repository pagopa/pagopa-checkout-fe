import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import InformationModal from "../modals/InformationModal";
import PrivacyPolicy from "./PrivacyPolicy";

export default function PrivacyTerms() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Box>
        <p>
          {t("inputCardPage.privacyDesc")}
          <a
            href="#"
            style={{ fontWeight: 600, textDecoration: "none" }}
            onClick={() => setModalOpen(true)}
          >
            {t("inputCardPage.privacyTerms")}
          </a>
        </p>
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
