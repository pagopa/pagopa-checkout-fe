/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Link } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentChoice } from "../features/payment/components/PaymentChoice/PaymentChoice";

export default function PaymentChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer
      title="paymentChoicePage.title"
      description="paymentChoicePage.description"
      link={
        <Link
          href="https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 600, textDecoration: "none" }}
          title={t("paymentChoicePage.costs")}
        >
          {t("paymentChoicePage.costs")}
        </Link>
      }
    >
      <Box sx={{ mt: 6 }}>
        <PaymentChoice />
        <Box py={4} sx={{ width: "100%", height: "100%" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate(-1)}
            style={{
              minWidth: "120px",
              height: "100%",
              minHeight: 45,
            }}
          >
            {t("paymentChoicePage.button")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
