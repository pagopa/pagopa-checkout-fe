import React from "react";
import { Box, Switch, Typography } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./themeContextProvider";

export const ThemeSwitch = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <Box display={"flex"} alignItems={"center"} gap={1}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <Switch checked={mode === "dark"} onChange={toggleTheme} />
        <Typography>{t("app.darkMode")}</Typography>
      </label>
    </Box>
  );
};
