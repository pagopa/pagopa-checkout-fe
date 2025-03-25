import React from "react";
import { Box, Switch, Typography } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "./themeContextProvider";

export const ThemeSwitch = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);

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
        <Typography>{mode === "dark" ? "Dark Mode" : "Light Mode"}</Typography>
      </label>
    </Box>
  );
};
