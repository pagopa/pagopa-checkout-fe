import React, { createContext, useState, useMemo, useEffect } from "react";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { theme, darkTheme } from "@pagopa/mui-italia";
import { SessionItems } from "../../utils/storage/sessionStorage";

export enum ThemeModes {
  DARK = "dark",
  LIGHT = "light",
}

const themeLight = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: ThemeModes.LIGHT,
    background: {
      default: theme.palette.background.paper,
    },
    custom: {
      drawer: {
        card: { sectionTitle: theme.palette.action.active },
        icon: { color: { main: theme.palette.action.active } },
      },
      footer: {
        principal: {
          background: { primary: theme.palette.background.default },
        },
        fixed: { background: { primary: "#f2f2f2" } },
      },
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
      ...theme.components?.MuiAlert,
      styleOverrides: {
        ...theme.components?.MuiAlert?.styleOverrides,
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
    mode: ThemeModes.DARK,
    background: {
      default: darkTheme.palette.background.paper,
    },
    text: {
      primary: "#fff",
      secondary: "#5C6F82",
    },
    action: {
      active: darkTheme.palette.common.white,
    },
    custom: {
      paymentSummary: { infoButton: { background: { default: "#252525" } } },
      drawer: {
        card: {
          background: {
            primary: "#252525",
          },
          sectionTitle: {
            primary: "#3DA2FF",
          },
          sectionBody: {
            primary: darkTheme.palette.common.white,
          },
        },
        icon: { color: { main: "#3DA2FF" } },
      },
      footer: {
        principal: {
          background: { primary: darkTheme.palette.background.default },
        },
        fixed: { background: { primary: "#424242" } },
      },
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
          "&.MuiLoadingButton-root.Mui-disabled": {
            backgroundColor: "rgba(62,63,64, 0.26)",
            color: "#5C6F82",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.MuiIconButton-root:hover": {
            backgroundColor: "#0C1519",
          },
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
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: darkTheme.palette.common.white,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "& .MuiListItemIcon-root": {
            color: darkTheme.palette.common.white,
          },
          "&:hover": {
            backgroundColor: alpha(darkTheme.palette.common.white, 0.04),
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow:
            "0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: darkTheme.palette.common.white,
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root.MuiTableSortLabel-icon": {
            color: darkTheme.palette.common.white,
          },
        },
      },
    },
  },
});

interface ThemeContextType {
  mode: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: ThemeModes.LIGHT,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleTheme: () => {},
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem(SessionItems.activeTheme) as string;
    return storedMode ? storedMode : ThemeModes.LIGHT;
  });

  useEffect(() => {
    localStorage.setItem(SessionItems.activeTheme, mode);
  }, [mode]);

  const theme = useMemo(
    () => (mode === ThemeModes.LIGHT ? themeLight : themeDark),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) =>
      prevMode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT
    );
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme } as ThemeContextType}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
