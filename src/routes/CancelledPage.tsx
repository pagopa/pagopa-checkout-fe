import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import cancelled from "../assets/images/response-unrecognized.svg";
import PageContainer from "../components/PageContent/PageContainer";
import { resetCheckData } from "../redux/slices/checkData";
import { onBrowserUnload } from "../utils/eventListeners";
import { loadState, SessionItems } from "../utils/storage/sessionStorage";

export default function CancelledPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const redirectUrl =
    (loadState(SessionItems.originUrlRedirect) as string) || "/";

  React.useEffect(() => {
    dispatch(resetCheckData());
    window.removeEventListener("beforeunload", onBrowserUnload);
  }, []);

  sessionStorage.clear();

  return (
    <PageContainer>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 6 }}
      >
        <img
          src={cancelled}
          alt="cancelled"
          style={{ width: "80px", height: "80px" }}
        />
        <Box mt={3} mb={3}>
          <Typography variant="h6" component="div">
            {t("cancelledPage.body")}
          </Typography>
        </Box>
        <Box pr={8} pl={8} sx={{ width: "100%", height: "100%" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate(redirectUrl)}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {t("cancelledPage.button")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
