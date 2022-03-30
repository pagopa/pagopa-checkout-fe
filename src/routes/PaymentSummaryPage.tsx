import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EuroIcon from "@mui/icons-material/Euro";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Typography } from "@mui/material";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PaymentRequestsGetResponse } from "../../generated/definitions/payment-activations-api/PaymentRequestsGetResponse";
import { RptId } from "../../generated/definitions/payment-activations-api/RptId";
import { FormButtons } from "../components/FormButtons/FormButtons";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  getNoticeInfo,
  getPaymentInfo,
  getReCaptchaKey,
  setPaymentId,
} from "../utils/api/apiService";
import {
  activePaymentTask,
  pollingActivationStatus,
} from "../utils/api/helper";
import { getConfigOrThrow } from "../utils/config/config";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import { moneyFormat } from "../utils/form/formatters";
import { CheckoutRoutes } from "./models/routeModel";

const config = getConfigOrThrow();

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

  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<number>();
  const ref = React.useRef<ReCAPTCHA>(null);

  const paymentInfo = getPaymentInfo();
  const noticeInfo = getNoticeInfo();

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  React.useEffect(() => {
    if (loading && !errorModalOpen) {
      const id = window.setTimeout(() => {
        setError(ErrorsType.POLLING_SLOW);
        setErrorModalOpen(true);
      }, config.CHECKOUT_API_TIMEOUT as number);
      setTimeoutId(id);
    } else if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }, [loading, errorModalOpen]);

  const onSubmit = React.useCallback(async () => {
    const rptId: RptId = `${noticeInfo.cf}${noticeInfo.billCode}`;
    setLoading(true);
    const token = await ref.current?.executeAsync();

    pipe(
      PaymentRequestsGetResponse.decode(paymentInfo),
      E.fold(
        () => onError(""),
        (response) =>
          pipe(
            activePaymentTask(
              response.importoSingoloVersamento,
              response.codiceContestoPagamento,
              rptId,
              token || ""
            ),
            TE.fold(
              (e: string) => async () => {
                onError(e);
              },
              () => async () => {
                void pollingActivationStatus(
                  response.codiceContestoPagamento,
                  config.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS as number,
                  (res) => {
                    setPaymentId(res);
                    setLoading(false);
                    navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`);
                  },
                  onError
                );
              }
            )
          )()
      )
    );
  }, [ref]);

  const onRetry = React.useCallback(() => {
    setErrorModalOpen(false);
    void onSubmit();
  }, []);

  return (
    <PageContainer
      title="paymentSummaryPage.title"
      description="paymentSummaryPage.description"
    >
      <FieldContainer
        title="paymentSummaryPage.creditor"
        body={paymentInfo.enteBeneficiario?.denominazioneBeneficiario}
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
          {paymentInfo.enteBeneficiario?.identificativoUnivocoBeneficiario}
        </Typography>
      </Box>

      <FormButtons
        submitTitle="paymentSummaryPage.buttons.submit"
        cancelTitle="paymentSummaryPage.buttons.cancel"
        disabledSubmit={false}
        loadingSubmit={loading}
        handleSubmit={onSubmit}
        handleCancel={() => navigate(-1)}
      />
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
          onRetry={onRetry}
        />
      )}
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
    </PageContainer>
  );
}
