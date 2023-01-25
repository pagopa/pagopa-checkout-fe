import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import ko from "../assets/images/response-umbrella.svg";
import PageContainer from "../components/PageContent/PageContainer";
import { useAppDispatch } from "../redux/hooks/hooks";
import { resetCardData } from "../redux/slices/cardData";
import { resetSecurityCode } from "../redux/slices/securityCode";
import { getReturnUrls } from "../utils/api/apiService";
import { onBrowserUnload } from "../utils/eventListeners";
import { clearSensitiveItems } from "../utils/storage/sessionStorage";

export default function KOPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const redirectUrl = getReturnUrls().returnErrorUrl;

  React.useEffect(() => {
    dispatch(resetSecurityCode());
    dispatch(resetCardData());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearSensitiveItems();
  }, []);

  return (
    <PageContainer>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 6 }}
      >
        <img
          src={ko}
          alt="ko-image"
          style={{ width: "80px", height: "80px" }}
        />
        <Box
          mt={3}
          mb={3}
          gap={2}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" component="div">
            {t("koPage.title")}
          </Typography>
          <Typography variant="body2" component="div">
            {t("koPage.body")}
          </Typography>
        </Box>
        <Box pr={8} pl={8} sx={{ width: "100%", height: "100%" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              sessionStorage.clear();
              window.location.replace(redirectUrl || "/");
            }}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {t("koPage.button")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
