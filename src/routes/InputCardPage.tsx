import { Box } from "@mui/material";
import cardValidator from "card-validator";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Typography, Button } from "@mui/material";
import { t } from "i18next";
import InformationModal from "../components/modals/InformationModal";
import { setThreshold } from "../redux/slices/threshold";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { InputCardForm } from "../features/payment/components/InputCardForm/InputCardForm";
import { PaymentMethod } from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { activatePayment, calculateFees } from "../utils/api/helper";
import { InputCardFormFields } from "../features/payment/models/paymentModel";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { CalculateFeeResponse } from "../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { CheckoutRoutes } from "./models/routeModel";
import { onErrorActivate } from "../utils/api/transactionsErrorHelper";

export default function InputCardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [wallet] = React.useState<InputCardFormFields>();
  const [hideCancelButton, setHideCancelButton] = React.useState(false);
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const ref = React.useRef<ReCAPTCHA>(null);
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

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onPspNotFound = () => {
    setLoading(false);
    setPspNotFoundModalOpen(true);
    ref.current?.reset();
  };

  const onResponseActivate = (bin: string) =>
    calculateFees({
      paymentId:
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
      bin,
      onError,
      onPspNotFound,
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

  const onSubmit = React.useCallback(
    async (wallet: InputCardFormFields) => {
      const cardData = {
        brand: cardValidator.number(wallet.number).card?.type || "",
        expDate: wallet.expirationDate,
        cardHolderName: wallet.name,
        cvv: wallet.cvv,
        pan: wallet.number,
      };
      setLoading(true);
      const recaptchaResponse = await ref.current?.executeAsync();
      const token = pipe(
        recaptchaResponse,
        O.fromNullable,
        O.getOrElse(() => "")
      );
      const transactionId = (
        getSessionItem(SessionItems.transaction) as
          | NewTransactionResponse
          | undefined
      )?.transactionId;
      const bin = cardData.pan.substring(0, 6);
      // If I want to change the card data but I have already activated the payment
      if (transactionId) {
        void onResponseActivate(bin);
      } else {
        await activatePayment({
          token,
          onResponseActivate,
          onErrorActivate: (faultCodeCategory, faultCodeDetail) => 
            onErrorActivate(faultCodeCategory, faultCodeDetail, onError, navigate)
        });
      }
    },
    [ref, error]
  );

  const onRetry = React.useCallback(() => {
    setErrorModalOpen(false);
    // it's useless without a setWallet
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
          titleId="inputCardPageErrorTitleId"
          errorId="inputCardPageErrorId"
          bodyId="inputCardPageErrorBodyId"
        />
      )}
      {!!pspNotFoundModal && (
        <InformationModal
          open={pspNotFoundModal}
          onClose={() => {
            setPspNotFoundModalOpen(false);
            window.location.replace(`/${CheckoutRoutes.SCEGLI_METODO}`);
          }}
          maxWidth="sm"
          hideIcon={true}
        >
          <Typography
            variant="h6"
            component={"div"}
            sx={{ pb: 2 }}
            id="pspNotFoundTitleId"
          >
            {t("pspUnavailable.title")}
          </Typography>
          <Typography
            variant="body1"
            component={"div"}
            sx={{ whiteSpace: "pre-line" }}
            id="pspNotFoundBodyId"
          >
            {t("pspUnavailable.body")}
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => {
                setPspNotFoundModalOpen(false);
                window.location.replace(`/${CheckoutRoutes.SCEGLI_METODO}`);
              }}
              id="pspNotFoundCtaId"
            >
              {t("pspUnavailable.cta.primary")}
            </Button>
          </Box>
        </InformationModal>
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
