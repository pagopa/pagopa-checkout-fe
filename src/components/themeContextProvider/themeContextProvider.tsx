import React, { createContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

const themeLight = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3a96ff",
    },
    secondary: {
      main: "#7a9e7f",
    },
  },
});

const themeDark = createTheme({
  palette: {
    primary: {
      main: "#eee",
    },
    secondary: {
      main: "#bbb",
    },
    mode: "dark",
  },
});

interface ThemeContextType {
  mode: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState(() => {
    const storedMode = getSessionItem(SessionItems.activeTheme) as string;
    return storedMode ? storedMode : "light";
  });

  useEffect(() => {
    setSessionItem(SessionItems.activeTheme, mode);
  }, [mode]);

  const theme = useMemo(
    () => (mode === "light" ? themeLight : themeDark),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme } as ThemeContextType}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
