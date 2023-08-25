/* eslint-disable import/order */
import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import { PaymentMethod } from "../../../../features/payment/models/paymentModel";
import { Field, RenderField } from "./IframeCardField";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import {
  activatePayment,
  calculateFees,
  retrieveCardData,
} from "../../../../utils/api/helper";
import { SessionPaymentMethodResponse } from "../../../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { CalculateFeeResponse } from "../../../../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { setThreshold } from "../../../../redux/slices/threshold";

interface Props {
  loading?: boolean;
  onCancel: () => void;
  onSubmit?: (bin: string) => void;
  hideCancel?: boolean;
}

interface FieldFormStatus {
  isValid: boolean;
  errorCode: null | string;
  errorMessage: null | string;
}

interface BuildResp {
  sessionId: string;
  paymentMethodData: PaymentMethodData;
}

interface PaymentMethodData {
  paymentMethod: string;
  form: Array<Field>;
}

export enum IdFields {
  "CARD_NUMBER" = "CARD_NUMBER",
  "EXPIRATION_DATE" = "EXPIRATION_DATE",
  "SECURITY_CODE" = "SECURITY_CODE",
  "CARDHOLDER_NAME" = "CARDHOLDER_NAME",
}
type FieldsFormStatus = Map<keyof typeof IdFields | string, FieldFormStatus>;

const initialFormStatus: FieldFormStatus = {
  isValid: false,
  errorCode: null,
  errorMessage: null,
};

const fieldformStatus: FieldsFormStatus = new Map();
Object.values(IdFields).forEach((k) => {
  fieldformStatus.set(k as keyof typeof IdFields, initialFormStatus);
});

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function IframeCardForm(props: Props) {
  const { onCancel, hideCancel } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<BuildResp>();
  const [spinner, setSpinner] = React.useState(loading);
  const [enabledForm, setEnabledForm] = React.useState(false);
  const ref = React.useRef<ReCAPTCHA>(null);
  // this dummy state is only used to permorm a component udpate, not the best solution but works
  const [, setDummyState] = React.useState(0);
  const dispatch = useAppDispatch();

  const [buildInstance, setBuildInstance] = React.useState();

  const calculateFormValidStatus = (
    fieldformStatus: Map<string, FieldFormStatus>
  ) => Array.from(fieldformStatus.values()).every((el) => el.isValid);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    // eslint-disable-next-line no-console
    console.log(errorModalOpen);
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
              setLoading(false);
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
    // eslint-disable-next-line no-console
    console.log(transactionId);
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

  React.useEffect(() => {
    if (!form) {
      const fetchForm = async () => {
        try {
          const { paymentMethodId } = getSessionItem(
            SessionItems.paymentMethod
          ) as PaymentMethod;
          const response = await fetch(
            `/ecommerce/checkout/v1/payment-methods/${paymentMethodId}/sessions`,
            {
              method: "POST",
            }
          );
          const body = (await response.json()) as BuildResp;
          setSessionItem(SessionItems.sessionId, body.sessionId);
          setForm(body);
        } catch (e) {
          onError(ErrorsType.GENERIC_ERROR);
        } finally {
          setSpinner(false);
        }
      };
      void fetchForm();

      const { hostname, protocol, port } = window.location;

      // THIS is mandatory cause the Build class is defined in the external library called NPG SDK
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newBuild = new Build({
        onBuildSuccess(evtData: { id: keyof typeof IdFields }) {
          const { id } = evtData;
          // write some code to manage the successful data entering in the specifiedfield: evtData.id
          if (Object.keys(IdFields).includes(id)) {
            fieldformStatus.set(id as unknown as keyof typeof IdFields, {
              isValid: true,
              errorCode: null,
              errorMessage: null,
            });
            setEnabledForm(calculateFormValidStatus(fieldformStatus));
            setDummyState(Math.random);
          }
        },
        onBuildError(evtData: {
          id: keyof typeof IdFields;
          errorCode: string;
          errorMessage: string;
        }) {
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
          const { id, errorCode, errorMessage } = evtData;
          if (Object.keys(IdFields).includes(id)) {
            fieldformStatus.set(id as unknown as keyof typeof IdFields, {
              isValid: false,
              errorCode,
              errorMessage,
            });
            setEnabledForm(calculateFormValidStatus(fieldformStatus));
            setDummyState(Math.random);
          }
        },
        onConfirmError(evtData: any) {
          // this event is returned as a consequence of the invocation of confirmData() SDK function.
          // the possible cases are:
          //   HF0002 –temporary unavailability of the service
          //   HF0003 -session expired–the payment experience shall be restarted from the post orders/build
          //   HF0007 –internal error–if the issue persists the payment has to be restarted
          // eslint-disable-next-line no-console
          console.log("onConfirmError", evtData);
        },
        onBuildFlowStateChange(
          _evtData: any,
          state:
            | "READY_FOR_PAYMENT"
            | "REDIRECTED_TO_EXTERNAL_DOMAIN"
            | "PAYMENT_COMPLETE"
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
          // eslint-disable-next-line no-console
          console.log("onBuildFlowStateChange", _evtData, state);
          if (state === "READY_FOR_PAYMENT") {
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
    }
  }, [form?.sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSpinner(true);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      buildInstance.confirmData(() => setSpinner(false));
    } catch (e) {
      setSpinner(false);
      onError(ErrorsType.GENERIC_ERROR);
    }
  };
  const { t } = useTranslation();

  return (
    <>
      {!error ? (
        spinner ? (
          "spinner"
        ) : (
          <form id="iframe-card-form" onSubmit={handleSubmit}>
            <Box>
              <Box>
                <RenderField
                  label={t("inputCardPage.formFields.number")}
                  fields={form?.paymentMethodData.form}
                  id={"CARD_NUMBER"}
                  errorCode={fieldformStatus.get("CARD_NUMBER")?.errorCode}
                  errorMessage={
                    fieldformStatus.get("CARD_NUMBER")?.errorMessage
                  }
                />
              </Box>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                sx={{ gap: 2 }}
              >
                <Box>
                  <RenderField
                    label={t("inputCardPage.formFields.expirationDate")}
                    fields={form?.paymentMethodData.form}
                    id={"EXPIRATION_DATE"}
                    errorCode={
                      fieldformStatus.get("EXPIRATION_DATE")?.errorCode
                    }
                    errorMessage={
                      fieldformStatus.get("EXPIRATION_DATE")?.errorMessage
                    }
                  />
                </Box>
                <Box>
                  <RenderField
                    label={t("inputCardPage.formFields.cvv")}
                    fields={form?.paymentMethodData.form}
                    id={"SECURITY_CODE"}
                    errorCode={fieldformStatus.get("SECURITY_CODE")?.errorCode}
                    errorMessage={
                      fieldformStatus.get("SECURITY_CODE")?.errorMessage
                    }
                  />
                </Box>
              </Box>
              <Box>
                <RenderField
                  label={t("inputCardPage.formFields.name")}
                  fields={form?.paymentMethodData.form}
                  id={"CARDHOLDER_NAME"}
                  errorCode={fieldformStatus.get("CARDHOLDER_NAME")?.errorCode}
                  errorMessage={
                    fieldformStatus.get("CARDHOLDER_NAME")?.errorMessage
                  }
                />
              </Box>
            </Box>
            <FormButtons
              loadingSubmit={loading}
              type="submit"
              submitTitle="paymentNoticePage.formButtons.submit"
              cancelTitle="paymentNoticePage.formButtons.cancel"
              disabledSubmit={!enabledForm}
              handleSubmit={handleSubmit}
              handleCancel={onCancel}
              hideCancel={hideCancel}
            />
          </form>
        )
      ) : (
        "Ops! something went wrong..."
      )}
    </>
  );
}
