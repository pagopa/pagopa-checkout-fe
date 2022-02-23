import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import { InputCardForm } from "../features/payment/components/InputCardForm/InputCardForm";

export default function InputCardPage() {
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[1];

  const onSubmit = React.useCallback(() => {
    navigate(`/${currentPath}/check`);
  }, []);
  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Box sx={{ mt: 6 }}>
        <InputCardForm onCancel={onCancel} onSubmit={onSubmit} />
      </Box>
    </PageContainer>
  );
}
