import { Box } from "@mui/material";
import cardValidator from "card-validator";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import { InputCardForm } from "../features/payment/components/InputCardForm/InputCardForm";
import {
  PaymentId,
  PaymentMethod,
  PspList,
  Transaction,
} from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { setCardData } from "../redux/slices/cardData";
import { setSecurityCode } from "../redux/slices/securityCode";
import {
  activatePayment,
  getPaymentPSPList,
  onErrorGetPSP,
  sortPspByOnUsPolicy,
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
      !!(getSessionItem(SessionItems.transaction) as Transaction | undefined)
        ?.transactionId
    );
  }, []);

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

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onResponse = () => {
    setLoading(false);
    navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
  };

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
      dispatch(setSecurityCode(cardData.cvv));
      setLoading(true);
      await getPaymentPSPList({
        paymentMethodId:
          (
            getSessionItem(SessionItems.paymentMethod) as
              | PaymentMethod
              | undefined
          )?.paymentMethodId || "",
        onError: onErrorGetPSP,
        onResponse: (resp: Array<PspList>) => {
          const firstPsp = sortPspByOnUsPolicy(resp);
          setSessionItem(SessionItems.pspSelected, {
            pspCode: firstPsp.at(0)?.idPsp || "",
            fee: firstPsp.at(0)?.commission || 0,
            businessName: firstPsp.at(0)?.name || "",
          });
        },
      });
      const paymentId = (
        getSessionItem(SessionItems.paymentId) as PaymentId | undefined
      )?.paymentId;
      const transactionId = (
        getSessionItem(SessionItems.transaction) as Transaction | undefined
      )?.transactionId;
      // If I want to change the card data but I have already activated the payment
      if (paymentId && transactionId) {
        onResponse();
      } else {
        await activatePayment({
          onResponse,
          onError,
          onNavigate: () => navigate(`/${CheckoutRoutes.ERRORE}`),
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
