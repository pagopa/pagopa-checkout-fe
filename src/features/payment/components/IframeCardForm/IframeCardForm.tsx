import React from "react";
import { Box } from "@mui/material";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";

interface Props {
  loading?: boolean;
  onCancel: () => void;
  onSubmit?: () => void;
  hideCancel?: boolean;
}

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
        height: 40,
        width: "100%",
        ...style,
      }}
    />
  );
};

export default function IframeCardForm(props: Props) {
  const { loading = true, onCancel, onSubmit = () => null, hideCancel } = props;
  const [error, setError] = React.useState(false);
  const [form, setForm] = React.useState<BuildResp>();
  const [spinner, setSpineer] = React.useState(loading);

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
  }, []);

  return (
    <>
      {!error ? (
        spinner ? (
          "spinner"
        ) : (
          <form id="iframe-card-form">
            <Box>
              {renderIframeInput(form?.fields, "CARD_NUMBER")}
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                sx={{ gap: 2 }}
              >
                {renderIframeInput(form?.fields, "EXPIRATION_DATE", {
                  width: "50%",
                })}
                {renderIframeInput(form?.fields, "SECURITY_CODE", {
                  width: "50%",
                })}
              </Box>
              {renderIframeInput(form?.fields, "CARDHOLDER_NAME")}
            </Box>
            <FormButtons
              loadingSubmit={loading}
              type="submit"
              submitTitle="paymentNoticePage.formButtons.submit"
              cancelTitle="paymentNoticePage.formButtons.cancel"
              disabledSubmit={true}
              handleSubmit={onSubmit}
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
