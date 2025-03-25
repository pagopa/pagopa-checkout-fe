import React, { createContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import {
  SessionItems,
} from "../../utils/storage/sessionStorage"
import { theme, darkTheme } from "@pagopa/mui-italia";


const themeLight = createTheme({
    ...theme,
  palette: {
    ...theme.palette,
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
  palette: {
    mode: "light",
  } as any,
});

const themeDark = createTheme({
    ...darkTheme,
  palette: {
    ...theme.palette,
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
  palette: {
    mode: "dark",
  } as any,
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
