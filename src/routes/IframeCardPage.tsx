import { Box } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import PageContainer from "../components/PageContent/PageContainer";
import IframeCardForm from "../features/payment/components/IframeCardForm/IframeCardForm";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";

export default function IFrameCardPage() {
  const navigate = useNavigate();
  const [loading] = React.useState(false);
  // const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  // const [error, setError] = React.useState("");
  // Is It allowed to store the bin temporary?
  // const [bin, setBin] = React.useState("");
  const [hideCancelButton, setHideCancelButton] = React.useState(false);
  const ref = React.useRef<ReCAPTCHA>(null);
  // const dispatch = useAppDispatch();

  React.useEffect(() => {
    setHideCancelButton(
      !!pipe(
        getSessionItem(SessionItems.transaction),
        NewTransactionResponse.decode,
        E.fold(
          () => undefined,
          (transaction) => transaction.transactionId
        )
      )
    );
  }, []);

  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Box sx={{ mt: 6 }}>
        <IframeCardForm
          onCancel={onCancel}
          hideCancel={hideCancelButton}
          loading={loading}
        />
      </Box>
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
