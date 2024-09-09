import { Box } from "@mui/material";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentEmailForm } from "../features/payment/components/PaymentEmailForm/PaymentEmailForm";
import {
  Cart,
  PaymentEmailFormFields,
} from "../features/payment/models/paymentModel";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { CheckoutRoutes } from "./models/routeModel";

type LocationProps = {
  state: {
    noConfirmEmail?: boolean;
  };
};

export default function PaymentEmailPage() {
  const { state } = useLocation() as unknown as LocationProps;
  const noConfirmEmail: boolean = (state && state.noConfirmEmail) || false;
  const navigate = useNavigate();
  const email = getSessionItem(SessionItems.useremail) as string | undefined;
  const cartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;

  const emailForm = noConfirmEmail
    ? { email: email || "", confirmEmail: "" }
    : { email: email || "", confirmEmail: email || "" };

  const onSubmit = React.useCallback((emailInfo: PaymentEmailFormFields) => {
    setSessionItem(SessionItems.useremail, emailInfo.email);
    navigate(`/${CheckoutRoutes.SCEGLI_METODO}`);
  }, []);

  const onCancel = () => navigate(-1);

  return (
    <>
      <PageContainer
        title="paymentEmailPage.title"
        description="paymentEmailPage.description"
      >
        <Box sx={{ mt: 6 }}>
          <PaymentEmailForm
            onCancel={onCancel}
            onSubmit={onSubmit}
            defaultValues={emailForm}
          />
          {cartInfo && <PrivacyInfo />}
        </Box>
      </PageContainer>
    </>
  );
}
