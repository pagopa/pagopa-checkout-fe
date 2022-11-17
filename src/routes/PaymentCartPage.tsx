import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { Cart } from "../features/payment/models/paymentModel";
import { setCart, setEmailInfo } from "../utils/api/apiService";
import { getCarts } from "../utils/api/helper";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentCartPage() {
  const navigate = useNavigate();
  const { cartid } = useParams();

  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onRetry = () => {
    setErrorModalOpen(false);
    void onSubmit();
  };

  const onResponse = (cart: Cart) => {
    setCart(cart);
    setEmailInfo({
      email: cart.emailNotice,
      confirmEmail: cart.emailNotice,
    });
    navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`, {
      replace: true,
      state: { noConfirmEmail: true },
    });
  };

  const onSubmit = React.useCallback(async () => {
    setLoading(true);

    if (cartid) {
      void getCarts(cartid, onError, onResponse);
    }
  }, []);

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
        onRetry={onRetry}
      />
    </>
  );
}
