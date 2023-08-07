import React from "react";

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

export default function IframeCardForm(props: Props) {
  const { loading = true, onCancel, hideCancel } = props;
  const [error, setError] = React.useState(false);
  const [form, setForm] = React.useState<BuildResp>();
  const [spinner, setSpineer] = React.useState(loading);

  React.useEffect(() => {
    const fetchForm = async () => {
      const response = await fetch("/checkout/payments/v1/build", {
        method: "GET",
      });
      const body = (await response.json()) as BuildResp;
      setForm(body);
      setSpineer(false);
    };

    try {
      void fetchForm();
    } catch (e) {
      setError(true);
      setSpineer(false);
    }
  }, []);

  return (
    <>
      {!error ? (
        spinner ? (
          "spinner"
        ) : (
          <form id="iframe-card-form">
            {form?.fields.map((input, i) => (
              <iframe
                src={input.src}
                key={`${form.sessionId}-${i}`}
                style={{ display: "block", border: "none", height: 40 }}
              />
            ))}
            {!hideCancel && (
              <input type="button" value="indietro" onClick={onCancel} />
            )}
            <input type="button" value="continua" disabled />
          </form>
        )
      ) : (
        "Ops! something went wrong..."
      )}
    </>
  );
}
