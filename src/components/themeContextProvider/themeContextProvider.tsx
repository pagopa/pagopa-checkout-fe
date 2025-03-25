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
      primary: "#fff", 
      secondary: "#fff", 
    },
  },
  components: {
    ...darkTheme.components,
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          height: 0,
          color: "#fff", 
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#fff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#fff", 
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#fff",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill": {
            backgroundColor: "#3e3f40", 
            color: "#fff", 
            "-webkit-box-shadow": "0 0 0 30px #3e3f40 inset", 
          },
        },
      },
    }
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
