import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { Cart } from "../features/payment/models/paymentModel";
import { setCart, setEmailInfo } from "../utils/api/apiService";
import { getCarts } from "../utils/api/helper";
import { CheckoutRoutes } from "./models/routeModel";

// mock
const mockCart = {
  emailNotice: "myemail@mail.it",
  paymentNotices: [
    {
      noticeNumber: "302012387654312384",
      fiscalCode: "77777777777",
      amount: 1000,
      description: "test",
      companyName: "test",
    },
  ],
  returnUrls: {
    returnOkUrl: "www.comune.di.prova.it/pagopa/success.html",
    returnCancelUrl: "www.comune.di.prova.it/pagopa/cancel.html",
    returnErrorUrl: "www.comune.di.prova.it/pagopa/error.html",
  },
};

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

    // delete this
    // use only to go forward in testing the flow with mocked data
    onResponse(mockCart);
  };

  const onResponse = (cart: Cart) => {
    setCart(mockCart);
    setEmailInfo({
      email: mockCart.emailNotice,
      confirmEmail: mockCart.emailNotice,
    });
    navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`, { replace: true });
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
      />
    </>
  );
}
