import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getSessionItem,
  SessionItems,
} from "../../../../utils/storage/sessionStorage";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import { PaymentMethod } from "../../../../features/payment/models/paymentModel";
import { Field, RenderField } from "./IframeCardField";

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
  const { loading = true, onCancel, onSubmit = () => null, hideCancel } = props;
  const [error, setError] = React.useState(false);
  const [form, setForm] = React.useState<BuildResp>();
  const [spinner, setSpinner] = React.useState(loading);
  const [enabledForm, setEnabledForm] = React.useState(false);
  // this dummy state is only used to permorm a component udpate, not the best solution but works
  const [, setDummyState] = React.useState(0);

  const { hostname, protocol, port } = window.location;

  const calculateFormValidStatus = (
    fieldformStatus: Map<string, FieldFormStatus>
  ) => Array.from(fieldformStatus.values()).every((el) => el.isValid);

  // THIS is mandatory cause the Build class is defined in the external library called NPG SDK
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const buildInstance = new Build({
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
      // console.log("onBuildFlowStateChange", evtData, state);
      if (state === "READY_FOR_PAYMENT") {
        void (async () => {
          try {
            const paymentMethodId = getSessionItem(
              SessionItems.paymentMethod
            ) as PaymentMethod;
            const response = await fetch(
              `/ecommerce/checkout/v1/payment-methods/${paymentMethodId}/sessions/${form?.sessionId}`,
              {
                method: "GET",
              }
            );
            const { bin } = await response.json();
            onSubmit(bin);
          } catch (e) {
            setError(true);
          }
        })();
      } else {
        setError(true);
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
          setForm(body);
        } catch (e) {
          setError(true);
        } finally {
          setSpinner(false);
        }
      };
      void fetchForm();
    }
  }, [form?.sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSpinner(true);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sdkBuildInstance.confirmData(() => setSpinner(false));
    } catch (e) {
      setSpinner(false);
      setError(true);
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
