import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { PaymentMethod } from "../../../../features/payment/models/paymentModel";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
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
import {
  NpgEvtData,
  NpgFlowState,
  NpgFlowStateEvtData,
} from "../../../../features/payment/models/npgModel";
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

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function IframeCardForm(props: Props) {
  const { onCancel, hideCancel } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [spinner, setSpinner] = React.useState(true);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<CreateSessionResponse>();
  const [formStatus, setFormStatus] =
    React.useState<FormStatus>(initialFieldsState);
  const ref = React.useRef<ReCAPTCHA>(null);
  const dispatch = useAppDispatch();

  const [buildInstance, setBuildInstance] = React.useState();

  const formIsValid = (fieldFormStatus: FormStatus) =>
    Object.values(fieldFormStatus).every((el) => el.isValid);

  const onError = (m: string) => {
    setLoading(false);
    setSpinner(false);
    setError(m);
    // the on error function as defined till now should open the error modal.
    // By the way we are developing the happy path and we can face this issue when we manage the error path
    // setErrorModalOpen(true);
    ref.current?.reset();
  };

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

  const retrievePaymentSession = (paymentMethodId: string, sessionId: string) =>
    retrieveCardData({
      paymentId: paymentMethodId,
      sessionId,
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

  const transaction = async () => {
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
    if (transactionId) {
      void retrievePaymentSession(
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
        getSessionItem(SessionItems.sessionId) as string
      );
    } else {
      await activatePayment({
        token,
        onResponseActivate: retrievePaymentSession,
        onErrorActivate: onError,
      });
    }
  };

  const updateFormStatus = (id: FieldId, status: FieldStatus) => {
    if (Object.keys(IdFields).includes(id)) {
      setFormStatus((fields) => ({
        ...fields,
        [id]: status,
      }));
    }
  };

  React.useEffect(() => {
    if (!form) {
      const { hostname, protocol, port } = window.location;
      const onResponse = (body: CreateSessionResponse) => {
        setSpinner(true);
        setSessionItem(SessionItems.sessionId, body.sessionId);
        setForm(body);

        // THIS is mandatory cause the Build class is defined in the external library called NPG SDK
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const newBuild = new Build({
          onBuildSuccess({ id }: NpgEvtData) {
            // write some code to manage the successful data entering in the specified field: evtData.id
            updateFormStatus(id, {
              isValid: true,
              errorCode: null,
              errorMessage: null,
            });
          },
          onBuildError({ id, errorCode, errorMessage }: NpgEvtData) {
            // write some code to manage the wrong data entering in the specified field: evtData.id
            // the action can be finely tuned based on the provided error code available at evtData.errorCode
            // the possible cases are:
            //   HF0001 -generic build field error
            //   HF0002 -temporary unavailability of the service
            //   HF0003 -session expired–the payment experience shall be restarted from the post orders/build
            //   HF0004 -card validation error–the key check on the card number was failed
            //   HF0005 -brand not found–the card brand is not in the list of supported brands
            //   HF0006 -expiration date exceeded–the provided card is expired
            //   HF0007 –internal error –if the issue persists the payment has to be restarted
            //   HF0009 –3DS GDI verification failed –the payment experience has to be stopped with failure.
            updateFormStatus(id, {
              isValid: false,
              errorCode,
              errorMessage,
            });
          },
          onConfirmError(_evtData: NpgEvtData) {
            // this event is returned as a consequence of the invocation of confirmData() SDK function.
            // the possible cases are:
            //   HF0002 –temporary unavailability of the service
            //   HF0003 -session expired–the payment experience shall be restarted from the post orders/build
            //   HF0007 –internal error–if the issue persists the payment has to be restarted
            onError(ErrorsType.GENERIC_ERROR);
          },
          onBuildFlowStateChange(
            _npgFlowStateEvtData: NpgFlowStateEvtData,
            npgFlowState: NpgFlowState
          ) {
            // this event is returned for each state transition of the payment state machine.
            // the possible states expressed by the value state are:
            // READY_FOR_PAYMENT: the card data has been properly collected and it is now possible to
            //   invoke the server to server
            //   posthttps://{nexiDomain}/api/phoenix-0.0/psp/api/v1/build/cardData?sessionId={thesessionId}
            //   to collect the non-PCI card information.
            // REDIRECTED_TO_EXTERNAL_DOMAIN: when this state is provided, the browser has to be redirected to
            //   the evtData.data.url external domain for strong customer authentication (i.e ACS URL).
            // PAYMENT_COMPLETE: the payment experience is finished. It is required to invoke
            //   the get https://{nexiDomain}/api/phoenix-0.0/psp/api/v1/build/state?sessionId={thesessionId}  },
            if (npgFlowState === NpgFlowState.READY_FOR_PAYMENT) {
              void transaction();
            } else {
              onError(ErrorsType.GENERIC_ERROR);
            }
          },
          cssLink: `${protocol}//${hostname}${
            process.env.NODE_ENV === "development" ? `:${port}` : ""
          }/npg/style.css`,
          defaultComponentCssClassName: "npg-component",
          defaultContainerCssClassName: "npg-container",
          // any dependency will initialize the build instance more than one time
          // and I think it's not a good idea. For the same reason I am not using
          // a react state to track the form status
        });
        setBuildInstance(newBuild);
        setSpinner(false);
      };

      void npgSessionsFields(onError, onResponse);
    }
  }, [form?.sessionId]);

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
    <form id="iframe-card-form" onSubmit={handleSubmit}>
      <Box>
        {error && "Ops! something went wrong..."}
        {spinner && "spinner"}
        <Box>
          <IframeCardField
            label={t("inputCardPage.formFields.number")}
            fields={form?.paymentMethodData.form}
            id={"CARD_NUMBER"}
            errorCode={formStatus.CARD_NUMBER?.errorCode}
            errorMessage={formStatus.CARD_NUMBER?.errorMessage}
            isValid={formStatus.CARD_NUMBER?.isValid}
          />
        </Box>
        <Box display={"flex"} justifyContent={"space-between"} sx={{ gap: 2 }}>
          <Box>
            <IframeCardField
              label={t("inputCardPage.formFields.expirationDate")}
              fields={form?.paymentMethodData.form}
              id={"EXPIRATION_DATE"}
              errorCode={formStatus.EXPIRATION_DATE?.errorCode}
              errorMessage={formStatus.EXPIRATION_DATE?.errorMessage}
              isValid={formStatus.EXPIRATION_DATE?.isValid}
            />
          </Box>
          <Box>
            <IframeCardField
              label={t("inputCardPage.formFields.cvv")}
              fields={form?.paymentMethodData.form}
              id={"SECURITY_CODE"}
              errorCode={formStatus.SECURITY_CODE?.errorCode}
              errorMessage={formStatus.SECURITY_CODE?.errorMessage}
              isValid={formStatus.SECURITY_CODE?.isValid}
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
  );
}
