import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EuroIcon from "@mui/icons-material/Euro";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { PaymentRequestsGetResponse } from "../../generated/definitions/payment-transactions-api/PaymentRequestsGetResponse";
import { RptId } from "../../generated/definitions/payment-transactions-api/RptId";
import { FormButtons } from "../components/FormButtons/FormButtons";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  getNoticeInfo,
  getPaymentInfo,
  setPaymentId,
} from "../utils/api/apiService";
import {
  activePaymentTask,
  pollingActivationStatus,
} from "../utils/api/helper";
import { getConfig } from "../utils/config/config";
import { moneyFormat } from "../utils/form/formatters";

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
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1];
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const paymentInfo = getPaymentInfo();
  const noticeInfo = getNoticeInfo();

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onSubmit = React.useCallback(() => {
    const rptId: RptId = `${noticeInfo.cf}${noticeInfo.billCode}`;
    setLoading(true);

    PaymentRequestsGetResponse.decode(paymentInfo).fold(
      () => onError(""),
      async (paymentInfo) =>
        await activePaymentTask(
          paymentInfo.importoSingoloVersamento,
          paymentInfo.codiceContestoPagamento,
          rptId
        )
          .fold(onError, () => {
            void pollingActivationStatus(
              paymentInfo.codiceContestoPagamento,
              getConfig("IO_PAY_PORTAL_PAY_WL_POLLING_ATTEMPTS") as number,
              (res) => {
                setPaymentId(res);
                setLoading(false);
                navigate(`/${currentPath}/paymentchoice`);
              }
            );
          })
          .run()
    );
  }, []);

  return (
    <PageContainer
      title="paymentSummaryPage.title"
      description="paymentSummaryPage.description"
    >
      <FieldContainer
        title="paymentSummaryPage.creditor"
        body={paymentInfo.enteBeneficiario.denominazioneBeneficiario}
        icon={<AccountBalanceIcon color="primary" sx={{ ml: 3 }} />}
      />
      <FieldContainer
        title="paymentSummaryPage.causal"
        body={paymentInfo.causaleVersamento}
        icon={<ReceiptLongIcon color="primary" sx={{ ml: 3 }} />}
      />
      <FieldContainer
        title="paymentSummaryPage.amount"
        body={moneyFormat(paymentInfo.importoSingoloVersamento)}
        icon={<EuroIcon color="primary" sx={{ ml: 3 }} />}
      />
      <Box sx={{ ...defaultStyle, pl: 2, pr: 2 }}>
        <Typography variant="body2" component={"div"} pr={2}>
          {t("paymentSummaryPage.cf")}
        </Typography>
        <Typography variant="sidenav" component={"div"}>
          {paymentInfo.enteBeneficiario.identificativoUnivocoBeneficiario}
        </Typography>
      </Box>

      <FormButtons
        submitTitle="paymentSummaryPage.buttons.submit"
        cancelTitle="paymentSummaryPage.buttons.cancel"
        disabled={false}
        loading={loading}
        handleSubmit={onSubmit}
        handleCancel={() => {
          navigate(-1);
        }}
      />
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
    </PageContainer>
  );
}
