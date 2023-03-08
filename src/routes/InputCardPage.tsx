import { Box } from "@mui/material";
import cardValidator from "card-validator";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { setThreshold } from "../redux/slices/threshold";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { InputCardForm } from "../features/payment/components/InputCardForm/InputCardForm";
import { PaymentMethod } from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { setCardData } from "../redux/slices/cardData";
import {
  activatePayment,
  calculateFees,
  onErrorGetPSP,
} from "../utils/api/helper";
import { InputCardFormFields } from "../features/payment/models/paymentModel";
import { getConfigOrThrow } from "../utils/config/config";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { Transfer } from "../../generated/definitions/payment-ecommerce/Transfer";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { BundleOption } from "../../generated/definitions/payment-ecommerce/BundleOption";
import { CheckoutRoutes } from "./models/routeModel";

export default function InputCardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [timeoutId, setTimeoutId] = React.useState<number>();
  const [wallet] = React.useState<InputCardFormFields>();
  const [hideCancelButton, setHideCancelButton] = React.useState(false);
  const ref = React.useRef<ReCAPTCHA>(null);
  const config = getConfigOrThrow();
  const dispatch = useAppDispatch();

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

  React.useEffect(() => {
    if (loading && !errorModalOpen) {
      const id = window.setTimeout(() => {
        setError(ErrorsType.STATUS_ERROR);
        setErrorModalOpen(true);
      }, config.CHECKOUT_API_TIMEOUT as number);
      setTimeoutId(id);
    } else if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }, [loading, errorModalOpen]);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onResponseActivate = (bin: string) =>
    calculateFees({
      paymentTypeCode:
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentTypeCode || "",
      bin,
      onError: onErrorGetPSP,
      onResponsePsp: (resp: BundleOption) => {
        pipe(
          resp,
          BundleOption.decode,
          O.fromEither,
          O.chain((r) => O.fromNullable(r.belowThreshold)),
          O.fold(
            () => onError(ErrorsType.GENERIC_ERROR),
            (belowThreshold) => setThreshold({ belowThreshold })
          )
        );

        const firstPsp = pipe(
          resp,
          O.fromNullable,
          O.chain((resp) => O.fromNullable(resp.bundleOptions)),
          O.chain((sortedArray) => O.fromNullable(sortedArray[0])),
          O.map((a) => a as Transfer),
          O.getOrElseW(() => ({}))
        );

        setSessionItem(SessionItems.pspSelected, firstPsp);
        setLoading(false);
        navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
      },
    });

  const onSubmit = React.useCallback(
    async (wallet: InputCardFormFields) => {
      const cardData = {
        brand: cardValidator.number(wallet.number).card?.type || "",
        expDate: wallet.expirationDate,
        cardHolderName: wallet.name,
        cvv: wallet.cvv,
        pan: wallet.number,
      };
      dispatch(setCardData(cardData));
      setLoading(true);
      const transactionId = (
        getSessionItem(SessionItems.transaction) as
          | NewTransactionResponse
          | undefined
      )?.transactionId;
      const bin = cardData.pan.substring(0, 8);
      // If I want to change the card data but I have already activated the payment
      if (transactionId) {
        void onResponseActivate(bin);
      } else {
        await activatePayment({
          bin,
          onResponseActivate,
          onErrorActivate: onError,
        });
      }
    },
    [ref, error]
  );

  const onRetry = React.useCallback(() => {
    setErrorModalOpen(false);
    void onSubmit(wallet as InputCardFormFields);
  }, [wallet, error]);

  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Box sx={{ mt: 6 }}>
        <InputCardForm
          onCancel={onCancel}
          onSubmit={onSubmit}
          hideCancel={hideCancelButton}
          loading={loading}
        />
      </Box>
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
