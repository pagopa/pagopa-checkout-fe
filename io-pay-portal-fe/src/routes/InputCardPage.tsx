import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import { InputCardForm } from "../features/payment/components/InputCardForm/InputCardForm";
import { InputCardFormFields } from "../features/payment/models/paymentModel";
import { getSessionWallet } from "../utils/api/helper";

export default function InputCardPage() {
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[1];
  const [loading, setLoading] = React.useState(false);

  const onError = () => {
    setLoading(false);
  };

  const onResponse = () => {
    setLoading(false);
    navigate(`/${currentPath}/check`);
  };

  const onSubmit = React.useCallback((wallet: InputCardFormFields) => {
    setLoading(true);
    void getSessionWallet(wallet, onError, onResponse);
  }, []);
  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Box sx={{ mt: 6 }}>
        <InputCardForm
          onCancel={onCancel}
          onSubmit={onSubmit}
          loading={loading}
        />
      </Box>
    </PageContainer>
  );
}
