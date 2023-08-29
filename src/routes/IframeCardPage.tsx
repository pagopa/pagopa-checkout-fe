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

  /*
  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };
  

  const retrievePaymentSession = (paymentMethodId: string, sessionId: string) =>
    retrieveCardData({
      paymentId: paymentMethodId,
      sessionId,
      onError,
      onResponseSessionPaymentMethod: (resp) => {
        pipe(
          resp,
          SessionPaymentMethodResponse.decode,
          E.map((resp) => getFees(resp.bin)),
          E.mapLeft(() => onError(ErrorsType.GENERIC_ERROR))
        );
      },
    });

  const getFees = (bin: string) =>
    calculateFees({
      paymentId:
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
      bin,
      onError,
      onResponsePsp: (resp) => {
        pipe(
          resp,
          CalculateFeeResponse.decode,
          O.fromEither,
          O.chain((resp) => O.fromNullable(resp.belowThreshold)),
          O.fold(
            () => onError(ErrorsType.GENERIC_ERROR),
            (value) => {
              dispatch(setThreshold({ belowThreshold: value }));
              const firstPsp = pipe(
                resp?.bundles,
                O.fromNullable,
                O.chain((sortedArray) => O.fromNullable(sortedArray[0])),
                O.map((a) => a as Bundle),
                O.getOrElseW(() => ({}))
              );

              setSessionItem(SessionItems.pspSelected, firstPsp);
              setLoading(false);
              navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
            }
          )
        );
      },
    });
*/
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
