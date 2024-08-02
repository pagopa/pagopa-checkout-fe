import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { Cart } from "../features/payment/models/paymentModel";
import { getCarts } from "../utils/api/helper";
import { adaptCartAsPaymentInfo, adaptCartAsRptId } from "../utils/cart/cart";
import { SessionItems, setSessionItem } from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentCartPage() {
  const navigate = useNavigate();
  const { cartid } = useParams();
  const [searchParams, _] = useSearchParams();

  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const cartClientId = searchParams.get("clientId");
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
    setSessionItem(SessionItems.cart, cart);
    setSessionItem(SessionItems.useremail, cart.emailNotice || "");
    // if b.e. does not communicate cart client id it is defaulted to CHECKOUT (the same value used without cart discrimination)
    setSessionItem(SessionItems.cartClientId, cartClientId || "CHECKOUT");
    adaptCartAsPaymentInfo(cart);
    adaptCartAsRptId(cart);
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
