import React from "react";
import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import InformationModal from "../modals/InformationModal";

export default function PrivacyTerms() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Box>
        <p>
          {t("inputCardPage.privacyDesc")}
          <Link
            href="#"
            style={{ fontWeight: 600, textDecoration: "none" }}
            onClick={() => setModalOpen(true)}
          >
            {t("inputCardPage.privacyTerms")}
          </Link>
        </p>
      </Box>
      <InformationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      ></InformationModal>
    </>
  );
}
