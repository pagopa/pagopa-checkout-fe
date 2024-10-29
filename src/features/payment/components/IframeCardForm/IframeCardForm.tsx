import { Box } from "@mui/material";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Typography, Button } from "@mui/material";
import { CreateSessionResponse } from "../../../../../generated/definitions/payment-ecommerce/CreateSessionResponse";
import { SessionPaymentMethodResponse } from "../../../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import ErrorModal from "../../../../components/modals/ErrorModal";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import {
  getFees,
  npgSessionsFields,
  recaptchaTransaction,
  retrieveCardData,
} from "../../../../utils/api/helper";
import createBuildConfig from "../../../../utils/buildConfig";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import { clearNavigationEvents } from "../../../../utils/eventListeners";
import {
  SessionItems,
  getReCaptchaKey,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { setThreshold } from "../../../../redux/slices/threshold";
import InformationModal from "../../../../components/modals/InformationModal";
import { IframeCardField } from "./IframeCardField";
import type { FieldId, FieldStatus, FormStatus } from "./types";
import { IdFields } from "./types";

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
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
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

  const [isAllFieldsLoaded, setIsAllFieldsLoaded] = React.useState(false);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const navigate = useNavigate();

  const onSuccess = (belowThreshold: boolean) => {
    dispatch(setThreshold({ belowThreshold }));
    navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
  };

  const onPspNotFound = () => {
    setLoading(false);
    setPspNotFoundModalOpen(true);
    ref.current?.reset();
  };

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
            () => getFees(onSuccess, onPspNotFound, onError, resp.bin)
          )
        );
      },
    });

  const onChange = (id: FieldId, status: FieldStatus) => {
    if (Object.keys(IdFields).includes(id)) {
      setActiveField(id);
      setFormStatus((fields) => ({
        ...fields,
        [id]: status,
      }));
    }
  };

  React.useEffect(() => {
    if (!form) {
      const onResponse = (body: CreateSessionResponse) => {
        setSessionItem(SessionItems.orderId, body.orderId);
        setSessionItem(SessionItems.correlationId, body.correlationId);
        setForm(body);
        const onReadyForPayment = () => {
          if (ref.current) {
            void recaptchaTransaction({
              recaptchaRef: ref.current,
              onSuccess: retrievePaymentSession,
              onError,
            });
          }
        };

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

        const onAllFieldsLoaded = () => {
          setLoading(false);
          setIsAllFieldsLoaded(true);
        };

        try {
          const newBuild = new Build(
            createBuildConfig({
              onChange,
              onReadyForPayment,
              onPaymentComplete,
              onPaymentRedirect,
              onBuildError,
              onAllFieldsLoaded,
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
    }
  }, [form?.orderId]);

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
              isAllFieldsLoaded={isAllFieldsLoaded}
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
                isAllFieldsLoaded={isAllFieldsLoaded}
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
                isAllFieldsLoaded={isAllFieldsLoaded}
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
              isAllFieldsLoaded={isAllFieldsLoaded}
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
          <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
            {t("pspUnavailable.title")}
          </Typography>
          <Typography
            variant="body1"
            component={"div"}
            sx={{ whiteSpace: "pre-line" }}
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
            >
              {t("pspUnavailable.cta.primary")}
            </Button>
          </Box>
        </InformationModal>
      )}
    </>
  );
}
