import { Box } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate, useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { getNoticeInfo, getReCaptchaKey } from "../utils/api/apiService";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentCartPage() {
  const navigate = useNavigate();
  const { cartid } = useParams();
  const noticeInfo = getNoticeInfo();

  const ref = React.useRef<ReCAPTCHA>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onSubmit = React.useCallback(async () => {
    setLoading(true);
    const token = await ref.current?.executeAsync();

    // call api GET /carts/{cartid}
    // navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`, { replace: true });
  }, [ref]);

  React.useEffect(() => {
    if (cartid) {
      void onSubmit();
    }
  }, [cartid]);

  return (
    <>
      {loading && <CheckoutLoader />}
      <ErrorModal
        error={error}
        open={errorModalOpen}
        onClose={() => {
          navigate(`/${CheckoutRoutes.ERRORE}`);
        }}
      />
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
    </>
  );
}
