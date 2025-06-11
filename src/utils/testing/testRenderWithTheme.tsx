import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  ThemeContext,
  ThemeModes,
} from "../../components/themeContextProvider/themeContextProvider";

// Create a simplified version of your light theme
const mockLightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    action: {
      active: "#000000",
    },
    custom: {
      paymentSummary: {
        infoButton: {
          background: {
            default: "#F5F5F5",
          },
        },
      },
      drawer: {
        card: {
          background: {
            default: "#FFFFFF",
          },
          sectionTitle: {
            primary: "#666666",
          },
          sectionBody: {
            primary: "#000000",
          },
        },
      },
      footer: {
        principal: {
          background: {
            default: "#F5F5F5",
          },
        },
        fixed: {
          background: {
            default: "#F2F2F2",
          },
        },
      },
    },
  } as any,
});

// Create a simplified version of your dark theme
const mockDarkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#121212",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#5C6F82",
    },
    action: {
      active: "#FFFFFF",
    },
    custom: {
      paymentSummary: { infoButton: { background: { default: "#252525" } } },
      drawer: {
        card: {
          background: {
            default: "#252525",
          },
          sectionTitle: {
            primary: "#3DA2FF",
          },
          sectionBody: {
            primary: "#FFFFFF",
          },
        },
      },
      footer: {
        principal: {
          background: {
            default: "#121212",
          },
        },
        fixed: {
          background: {
            default: "#424242",
          },
        },
      },
    },
  } as any,
});

export const MockThemeProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: ThemeModes;
  toggleThemeSpy?: jest.Mock;
}> = ({ children, initialMode = ThemeModes.LIGHT, toggleThemeSpy }) => {
  const [mode, setMode] = React.useState(initialMode);

  const toggleTheme = () => {
    if (toggleThemeSpy) {
      toggleThemeSpy();
    }
    setMode((prevMode) =>
      prevMode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT
    );
  };

  const theme = mode === ThemeModes.LIGHT ? mockLightTheme : mockDarkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
