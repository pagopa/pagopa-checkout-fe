import { Button } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const SkipToContent = () => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const linkStyle: any = {
    transition: "opacity 0.2s ease-out",
    opacity: isFocused ? "1" : "0",
    cursor: isFocused ? "" : "default",
  };

  return (
    <Button
      href="#main_content"
      style={linkStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {t("mainPage.main.skipToContent")}
    </Button>
  );
};

export default SkipToContent;
