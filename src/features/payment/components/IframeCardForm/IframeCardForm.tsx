import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { useNavigate } from "react-router-dom";
import { PaymentMethod } from "../../../../features/payment/models/paymentModel";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
  getReCaptchaKey,
} from "../../../../utils/storage/sessionStorage";
import {
  activatePayment,
  calculateFees,
  npgSessionsFields,
  retrieveCardData,
} from "../../../../utils/api/helper";
import { SessionPaymentMethodResponse } from "../../../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { CalculateFeeResponse } from "../../../../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { setThreshold } from "../../../../redux/slices/threshold";
import { CreateSessionResponse } from "../../../../../generated/definitions/payment-ecommerce/CreateSessionResponse";
import ErrorModal from "../../../../components/modals/ErrorModal";
import createBuildConfig from "../../../../utils/buildConfig";
import { clearNavigationEvents } from "../../../../utils/eventListeners";
import { IframeCardField } from "./IframeCardField";
import type { FieldId, FieldStatus, FormStatus } from "./types";
import { IdFields } from "./types";
import { useOnMountUnsafe } from "hooks/useOnMountUnsafe";

interface Props {
  loading?: boolean;
  onCancel: () => void;
  onSubmit?: (bin: string) => void;
  hideCancel?: boolean;
}

const initialFieldStatus: FieldStatus = {
  isValid: undefined,
  errorCode: null,
  errorMessage: null,
};

const initialFieldsState: FormStatus = Object.values(
  IdFields
).reduce<FormStatus>(
  (acc, idField) => ({ ...acc, [idField]: initialFieldStatus }),
  {} as FormStatus
);

const callRecaptcha = async (recaptchaInstance: ReCAPTCHA, reset = false) => {
  if (reset) {
    void recaptchaInstance.reset();
  }
  const recaptchaResponse = await recaptchaInstance.executeAsync();
  return pipe(
    recaptchaResponse,
    O.fromNullable,
    O.getOrElse(() => "")
  );
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function IframeCardForm(props: Props) {
  const { onCancel, hideCancel } = props;
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<CreateSessionResponse>();
  const [activeField, setActiveField] = React.useState<FieldId | undefined>(
    undefined
  );
  const [formStatus, setFormStatus] =
    React.useState<FormStatus>(initialFieldsState);
  const ref = React.useRef<ReCAPTCHA>(null);
  const dispatch = useAppDispatch();

  const [buildInstance, setBuildInstance] = React.useState();

  const formIsValid = (fieldFormStatus: FormStatus) =>
    Object.values(fieldFormStatus).every((el) => el.isValid);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };


  const navigate = useNavigate();

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
              navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
            }
          )
        );
      },
    });

  const retrievePaymentSession = (paymentMethodId: string, orderId: string) =>
    retrieveCardData({
      paymentId: paymentMethodId,
      orderId,
      onError,
      onResponseSessionPaymentMethod: (resp) => {
        pipe(
          resp,
          SessionPaymentMethodResponse.decode,
          O.fromEither,
          O.chain((resp) => O.fromNullable(resp.bin)),
          O.fold(
            () => onError(ErrorsType.GENERIC_ERROR),
            () => getFees(resp.bin)
          )
        );
      },
    });

  const transaction = async (recaptchaRef: ReCAPTCHA) => {
    const token = await callRecaptcha(recaptchaRef, true);
    /* temporarily dropped
    const transactionId = (
      getSessionItem(SessionItems.transaction) as
        | NewTransactionResponse
        | undefined
    )?.transactionId;
    if (transactionId) {
      void retrievePaymentSession(
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
        getSessionItem(SessionItems.orderId) as string
      );
    } else {
      await activatePayment({
        token,
        onResponseActivate: retrievePaymentSession,
        onErrorActivate: onError,
      });
    } */
    await activatePayment({
      token,
      onResponseActivate: retrievePaymentSession,
      onErrorActivate: onError,
    });
  };

  const onChange = (id: FieldId, status: FieldStatus) => {
    if (Object.keys(IdFields).includes(id)) {
      setActiveField(id);
      setFormStatus((fields) => ({
        ...fields,
        [id]: status,
      }));
    }
  };

  useEffect(()=>{if (!form) {
    const onResponse = (body: CreateSessionResponse) => {
      setSessionItem(SessionItems.orderId, body.orderId);
      setSessionItem(SessionItems.correlationId, body.correlationId);
      setForm(body);
      const onReadyForPayment = () =>
        ref.current && void transaction(ref.current);

      const onPaymentComplete = () => {
        clearNavigationEvents();
        window.location.replace(`/${CheckoutRoutes.ESITO}`);
      };

      const onPaymentRedirect = (urlredirect: string) => {
        clearNavigationEvents();
        window.location.replace(urlredirect);
      };

      const onBuildError = () => {
        setLoading(false);
        window.location.replace(`/${CheckoutRoutes.ERRORE}`);
      };

      try {
        const newBuild = new Build(
          createBuildConfig({
            onChange,
            onReadyForPayment,
            onPaymentComplete,
            onPaymentRedirect,
            onBuildError,
          })
        );
        setBuildInstance(newBuild);
      } catch {
        onBuildError();
      }
    };

    void (async () => {
      const token = ref.current ? await callRecaptcha(ref.current) : "";
      void npgSessionsFields(onError, onResponse, token);
    })();
  }}, [form?.orderId])

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      buildInstance.confirmData(() => setLoading(true));
    } catch (e) {
      onError(ErrorsType.GENERIC_ERROR);
    }
  };

  const { t } = useTranslation();

  return (
    <>
      <form id="iframe-card-form" onSubmit={handleSubmit}>
        <Box>
          <Box>
            <IframeCardField
              label={t("inputCardPage.formFields.number")}
              fields={form?.paymentMethodData.form}
              id={"CARD_NUMBER"}
              errorCode={formStatus.CARD_NUMBER?.errorCode}
              errorMessage={formStatus.CARD_NUMBER?.errorMessage}
              isValid={formStatus.CARD_NUMBER?.isValid}
              activeField={activeField}
            />
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            sx={{ gap: 2 }}
          >
            <Box sx={{ flex: "1 1 0" }}>
              <IframeCardField
                label={t("inputCardPage.formFields.expirationDate")}
                fields={form?.paymentMethodData.form}
                id={"EXPIRATION_DATE"}
                errorCode={formStatus.EXPIRATION_DATE?.errorCode}
                errorMessage={formStatus.EXPIRATION_DATE?.errorMessage}
                isValid={formStatus.EXPIRATION_DATE?.isValid}
                activeField={activeField}
              />
            </Box>
            <Box width="50%">
              <IframeCardField
                label={t("inputCardPage.formFields.cvv")}
                fields={form?.paymentMethodData.form}
                id={"SECURITY_CODE"}
                errorCode={formStatus.SECURITY_CODE?.errorCode}
                errorMessage={formStatus.SECURITY_CODE?.errorMessage}
                isValid={formStatus.SECURITY_CODE?.isValid}
                activeField={activeField}
              />
            </Box>
          </Box>
          <Box>
            <IframeCardField
              label={t("inputCardPage.formFields.name")}
              fields={form?.paymentMethodData.form}
              id={"CARDHOLDER_NAME"}
              errorCode={formStatus.CARDHOLDER_NAME?.errorCode}
              errorMessage={formStatus.CARDHOLDER_NAME?.errorMessage}
              isValid={formStatus.CARDHOLDER_NAME?.isValid}
              activeField={activeField}
            />
          </Box>
        </Box>
        <FormButtons
          loadingSubmit={loading}
          type="submit"
          submitTitle="paymentNoticePage.formButtons.submit"
          cancelTitle="paymentNoticePage.formButtons.cancel"
          disabledSubmit={loading || !formIsValid(formStatus)}
          handleSubmit={handleSubmit}
          handleCancel={onCancel}
          hideCancel={hideCancel}
        />
      </form>
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
      {!!errorModalOpen && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            window.location.replace(`/${CheckoutRoutes.ERRORE}`);
          }}
          titleId="iframeCardFormErrorTitleId"
          errorId="iframeCardFormErrorId"
          bodyId="iframeCardFormErrorBodyId"
        />
      )}
    </>
  );
}
