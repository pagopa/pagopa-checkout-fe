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
    position: "relative",
    opacity: isFocused ? "1" : "0",
    zIndex: isFocused ? "1" : "-1",
  };

  return (
    <div style={{ position: "relative" }}>
      <Button
        id="skip-to-content"
        onClick={() => document.getElementById("main_content")?.focus()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={linkStyle}
      >
        {t("mainPage.main.skipToContent")}
      </Button>
    </div>
  );
};

export default SkipToContent;
