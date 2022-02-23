/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/cognitive-complexity */
import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentChoice } from "../features/payment/components/PaymentChoice/PaymentChoice";
import {
  getCheckData,
  getPaymentId,
  setCheckData,
} from "../utils/api/apiService";
import { getPaymentCheckData } from "../utils/api/helper";

export default function PaymentChoicePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const paymentId = getPaymentId();
  const checkData = getCheckData();

  React.useEffect(() => {
    if (!checkData.idPayment) {
      setLoading(true);
      void getPaymentCheckData({
        idPayment: paymentId.paymentId,
        onError: () => setLoading(false), // handle error on response,
        onResponse: (r) => {
          setCheckData(r);
          setLoading(false);
        },
        onNavigate: () => {}, // navigate to ko page,
      });
    }
  }, [checkData.idPayment]);

  return loading ? (
    <CircularProgress />
  ) : (
    <PageContainer
      title="paymentChoicePage.title"
      description="paymentChoicePage.description"
      link={
        <a
          href="https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 600, textDecoration: "none" }}
        >
          {t("paymentChoicePage.costs")}
        </a>
      }
    >
      <Box sx={{ mt: 6 }}>
        <PaymentChoice />
      </Box>
    </PageContainer>
  );
}
