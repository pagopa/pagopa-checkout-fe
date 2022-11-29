import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ko from "../assets/images/response-umbrella.svg";
import PageContainer from "../components/PageContent/PageContainer";
import { resetCheckData } from "../redux/slices/checkData";
import { getReturnUrls } from "../utils/api/apiService";
import { onBrowserUnload } from "../utils/eventListeners";
import { clearSensitiveItems } from "../utils/storage/sessionStorage";

export default function KOPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const redirectUrl = getReturnUrls().returnErrorUrl;

  React.useEffect(() => {
    dispatch(resetCheckData());
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
