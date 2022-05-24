import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EuroIcon from "@mui/icons-material/Euro";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { FormButtons } from "../components/FormButtons/FormButtons";
import PageContainer from "../components/PageContent/PageContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import { getPaymentInfo } from "../utils/api/apiService";
import { moneyFormat } from "../utils/form/formatters";
import { CheckoutRoutes } from "./models/routeModel";

const defaultStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid",
  borderBottomColor: "#EFEFEF",
  pt: 2,
  pb: 2,
};

export default function PaymentSummaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const paymentInfo = getPaymentInfo();

  const onSubmit = React.useCallback(async () => {
    navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`);
  }, []);

  return (
    <PageContainer
      title="paymentSummaryPage.title"
      description="paymentSummaryPage.description"
    >
      {!!paymentInfo.enteBeneficiario?.denominazioneBeneficiario && (
        <FieldContainer
          title="paymentSummaryPage.creditor"
          body={paymentInfo.enteBeneficiario?.denominazioneBeneficiario}
          icon={<AccountBalanceIcon color="primary" sx={{ ml: 3 }} />}
        />
      )}
      {!!paymentInfo.causaleVersamento && (
        <FieldContainer
          title="paymentSummaryPage.causal"
          body={paymentInfo.causaleVersamento}
          icon={<ReceiptLongIcon color="primary" sx={{ ml: 3 }} />}
        />
      )}
      <FieldContainer
        title="paymentSummaryPage.amount"
        body={moneyFormat(paymentInfo.importoSingoloVersamento)}
        icon={<EuroIcon color="primary" sx={{ ml: 3 }} />}
      />
      {!!paymentInfo.enteBeneficiario?.identificativoUnivocoBeneficiario && (
        <Box sx={{ ...defaultStyle, pl: 2, pr: 2 }}>
          <Typography variant="body2" component={"div"} pr={2}>
            {t("paymentSummaryPage.cf")}
          </Typography>
          <Typography variant="sidenav" component={"div"}>
            {paymentInfo.enteBeneficiario?.identificativoUnivocoBeneficiario}
          </Typography>
        </Box>
      )}

      <FormButtons
        submitTitle="paymentSummaryPage.buttons.submit"
        cancelTitle="paymentSummaryPage.buttons.cancel"
        disabledSubmit={false}
        handleSubmit={onSubmit}
        handleCancel={() => navigate(-1)}
      />
    </PageContainer>
  );
}
