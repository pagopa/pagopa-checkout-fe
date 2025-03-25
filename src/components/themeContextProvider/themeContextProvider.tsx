import React, { createContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { theme, darkTheme } from "@pagopa/mui-italia";
import { SessionItems } from "../../utils/storage/sessionStorage";

const themeLight = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: "light",
    background: {
      default: theme.palette.background.paper,
    },
  },
  components: {
    ...theme.components,
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          height: 0,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
  },
});

const themeDark = createTheme({
  ...darkTheme,
  palette: {
    ...darkTheme.palette,
    mode: "dark",
    background: {
      default: darkTheme.palette.background.paper,
    },
    text: {
      primary: "#fff", // Set primary text color to white
      secondary: "#fff", // Set secondary text color to white
    },
  },
  components: {
    ...darkTheme.components,
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          height: 0,
          color: "#fff", // Ensure the helper text is white
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#fff", // Ensure the alert text is white
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#fff", // Set button text color to white
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#fff", // Set Typography text color to white
        },
      },
    },
    // You can add other components here if needed, to ensure all text elements are white
  },
});

interface ThemeContextType {
  mode: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleTheme: () => {},
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem(SessionItems.activeTheme) as string;
    return storedMode ? storedMode : "light";
  });

  useEffect(() => {
    localStorage.setItem(SessionItems.activeTheme, mode);
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
