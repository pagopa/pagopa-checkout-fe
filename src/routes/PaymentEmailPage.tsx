import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentEmailForm } from "../features/payment/components/PaymentEmailForm/PaymentEmailForm";
import { PaymentEmailFormFields } from "../features/payment/models/paymentModel";
import { getEmailInfo, setEmailInfo } from "../utils/api/apiService";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentEmailPage() {
  const navigate = useNavigate();
  const emailInfo = getEmailInfo();

  const onSubmit = React.useCallback((emailInfo: PaymentEmailFormFields) => {
    setEmailInfo(emailInfo);
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
            defaultValues={emailInfo}
          />
        </Box>
      </PageContainer>
    </>
  );
}
