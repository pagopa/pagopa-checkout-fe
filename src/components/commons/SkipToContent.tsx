import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const SkipToContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      component="a"
      href="#main_content"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        transform: "translateY(-150%)",
        px: 2,
        py: 1,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontWeight: 600,
        textAlign: "center",
        display: "block",
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        transition: "transform 0.2s ease-out",
        "&:focus, &:focus-visible": {
          transform: "translateY(0)",
        },
      }}
    >
      {t("mainPage.main.skipToContent")}
    </Box>
  );
};

export default SkipToContent;
