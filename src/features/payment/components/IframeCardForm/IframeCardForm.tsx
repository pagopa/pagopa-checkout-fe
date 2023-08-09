import React from "react";
import { Box } from "@mui/material";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";

interface Props {
  loading?: boolean;
  onCancel: () => void;
  onSubmit?: () => void;
  hideCancel?: boolean;
}

interface FieldFormStatus {
  isValid: boolean;
  errorCode: null | string;
  errorMessage: null | string;
}

type IdFields =
  | "CARD_NUMBER"
  | "EXPIRATION_DATE"
  | "SECURITY_CODE"
  | "CARDHOLDER_NAME";

type FieldsFormStatus = Map<IdFields, FieldFormStatus>;

interface Field {
  type: string;
  id: string;
  src: string;
  class: string;
}

interface BuildResp {
  sessionId: string;
  securityToken: string;
  fields: Array<Field>;
}

const getSrcFromFieldsByID = (fields: Array<Field>, id: string) =>
  fields.find((field) => field.id === id)?.src;

const renderIframeInput = (
  fields?: Array<Field>,
  id?: string,
  style?: React.CSSProperties
) => {
  if (!fields) {
    return;
  }
  if (!id) {
    return;
  }
  const src = getSrcFromFieldsByID(fields, id);
  if (!src) {
    return;
  }
  return (
    <iframe
      src={src}
      style={{
        display: "block",
        border: "none",
        height: 30,
        width: "100%",
        ...style,
      }}
    />
  );
};

const initialFormStatus: FieldFormStatus = {
  isValid: false,
  errorCode: null,
  errorMessage: null,
};

const fieldformStatus: FieldsFormStatus = new Map();
fieldformStatus.set("CARD_NUMBER", initialFormStatus);
fieldformStatus.set("EXPIRATION_DATE", initialFormStatus);
fieldformStatus.set("SECURITY_CODE", initialFormStatus);
fieldformStatus.set("CARDHOLDER_NAME", initialFormStatus);

// eslint-disable-next-line functional/no-let
let formStatus = false;
// eslint-disable-next-line functional/no-let
let sdkBuildIstance: { confirmData: () => void };

export default function IframeCardForm(props: Props) {
  const { loading = true, onCancel, onSubmit = () => null, hideCancel } = props;
  const [error, setError] = React.useState(false);
  const [form, setForm] = React.useState<BuildResp>();
  const [spinner, setSpineer] = React.useState(loading);
  // this dummy state is only used to permorm a component udpate, not the best solution but works
  const [, setDummyState] = React.useState(0);

  const calculateFormValidStatus = (
    fieldformStatus: Map<string, FieldFormStatus>
  ) =>
    [
      fieldformStatus.get("CARD_NUMBER")?.isValid,
      fieldformStatus.get("EXPIRATION_DATE")?.isValid,
      fieldformStatus.get("SECURITY_CODE")?.isValid,
      fieldformStatus.get("CARDHOLDER_NAME")?.isValid,
    ].every((isValid) => isValid);

  React.useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch("/checkout/payments/v1/build", {
          method: "GET",
        });
        const body = (await response.json()) as BuildResp;
        setForm(body);
      } catch (e) {
        setError(true);
      } finally {
        setSpineer(false);
      }
    };
    void fetchForm();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sdkBuildIstance = new Build({
      onBuildSuccess(evtData: { id: IdFields }) {
        // write some code to manage the successful data entering in the specifiedfield: evtData.id
        fieldformStatus.set(evtData.id, {
          isValid: true,
          errorCode: null,
          errorMessage: null,
        });
        formStatus = calculateFormValidStatus(fieldformStatus);
        setDummyState(Math.random);
      },
      // eslint-disable-next-line sonarjs/no-identical-functions
      onBuildError(evtData: {
        id: IdFields;
        errorCode: string;
        errorMessage: string;
      }) {
        // write some code to manage the wrongdata entering in the specifiedfield: evtData.id
        // the action can be finely tuned based on the provided error code available at evtData.errorCode
        // the possible casesare:
        //   HF0001 -generic build field error
        //   HF0002 -temporary unavailability of the service
        //   HF0003 -session expired–the payment experience shall be restarted from the post orders/build
        //   HF0004 -card validation error–the luhn key check on the card number was failed
        //   HF0005 -brand not found–the card brand is not in the list of supported brands
        //   HF0006 -expiration date exceeded–the provided card is expired
        //   HF0007 –internal error –if the issue persists the payment has to be restarted
        //   HF0009 –3DS GDI verification failed –the payment experience has to be stopped with failure.
        const { id, errorCode, errorMessage } = evtData;
        fieldformStatus.set(id, {
          isValid: false,
          errorCode,
          errorMessage,
        });
        formStatus = calculateFormValidStatus(fieldformStatus);
        setDummyState(Math.random);
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
        evtData: any,
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
        console.debug("onBuildFlowStateChange", evtData, state);
      },
      // any dependency will initialize the build istance more than one time
      // and I think it's not a good idea. For the same reason I am not using
      // a react state to track the form status
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sdkBuildIstance?.confirmData();
    onSubmit();
  };

  return (
    <>
      {!error ? (
        spinner ? (
          "spinner"
        ) : (
          <form id="iframe-card-form" onSubmit={handleSubmit}>
            <Box>
              <Box minHeight={60}>
                {renderIframeInput(form?.fields, "CARD_NUMBER")}
                {fieldformStatus.get("CARD_NUMBER")?.errorMessage}
              </Box>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                sx={{ gap: 2 }}
              >
                <Box minHeight={60}>
                  {renderIframeInput(form?.fields, "EXPIRATION_DATE")}
                  {fieldformStatus.get("EXPIRATION_DATE")?.errorMessage}
                </Box>
                <Box minHeight={60}>
                  {renderIframeInput(form?.fields, "SECURITY_CODE")}
                  {fieldformStatus.get("SECURITY_CODE")?.errorMessage}
                </Box>
              </Box>
              <Box minHeight={60}>
                {renderIframeInput(form?.fields, "CARDHOLDER_NAME")}
                {fieldformStatus.get("CARDHOLDER_NAME")?.errorMessage}
              </Box>
            </Box>
            <FormButtons
              loadingSubmit={loading}
              type="submit"
              submitTitle="paymentNoticePage.formButtons.submit"
              cancelTitle="paymentNoticePage.formButtons.cancel"
              disabledSubmit={!formStatus}
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
