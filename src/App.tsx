import { alpha, createTheme, Theme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { pxToRem, theme } from "@pagopa/mui-italia";
import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { indigo } from "@mui/material/colors";
import Guard from "./components/commons/Guard";
import { Layout } from "./components/commons/Layout";
import NoticeGuard from "./components/commons/NoticeGuard";
import RptidGuard from "./components/commons/RptidGuard";
import CancelledPage from "./routes/CancelledPage";
import DonationPageDismissed from "./routes/DonationPageDismissed";
import IndexPage from "./routes/IndexPage";
import IframeCardPage from "./routes/IframeCardPage";
import KOPage from "./routes/KOPage";
import { CheckoutRoutes } from "./routes/models/routeModel";
import PaymentCartPage from "./routes/PaymentCartPage";
import PaymentCheckPage from "./routes/PaymentCheckPage";
import PaymentChoicePage from "./routes/PaymentChoicePage";
import PaymentEmailPage from "./routes/PaymentEmailPage";
import PaymentNoticePage from "./routes/PaymentNoticePage";
import PaymentOutlet from "./routes/PaymentOutlet";
import PaymentQrPage from "./routes/PaymentQrPage";
import PaymentResponsePage from "./routes/PaymentResponsePage";
import PaymentResponsePageV2 from "./routes/PaymentResponsePageV2";
import PaymentSummaryPage from "./routes/PaymentSummaryPage";
import GdiCheckPage from "./routes/GdiCheckPage";
import "./translations/i18n";
import { mixpanelInit } from "./utils/config/mixpanelHelperInit";
import { SessionItems } from "./utils/storage/sessionStorage";
import SessionExpiredPage from "./routes/SessionExpiredPage";
import AuthCallback from "./routes/AuthCallbackPage";
import AuthExpiredPage from "./routes/AuthExpiredPage";
import PaymentPspListPage from "./routes/PaymentPspListPage";

const colorTextPrimary = "#17324D";

export const focusWidth = "2px";
export const focusBorderRadius = "8px";
export const focusOffset = "4px";
const focusButtonOffset = "2px";

const mainTypeface = ['"Titillium Web"', "sans-serif"].join(", ");
/* eslint-disable functional/immutable-data */
const shadowsArray = Array(25).fill("none") as any;

const shadowColor = "#002B55";

const colorPrimaryContainedHover = "#0055AA"; // Not exposed by the theme object

const shadowValues = {
  /* Elevation 4 */
  4: `0px 2px 4px -1px ${alpha(shadowColor, 0.1)},
      0px 4px 5px ${alpha(shadowColor, 0.05)},
      0px 1px 10px ${alpha(shadowColor, 0.1)}`,
  /* Elevation 8 = Elevation 16 */
  8: `0px 8px 10px -5px ${alpha(shadowColor, 0.1)},
      0px 16px 24px 2px ${alpha(shadowColor, 0.05)},
      0px 6px 30px 5px ${alpha(shadowColor, 0.1)}`,
  /* Elevation 16 */
  16: `0px 8px 10px -5px ${alpha(shadowColor, 0.1)},
       0px 16px 24px 2px ${alpha(shadowColor, 0.05)},
       0px 6px 30px 5px ${alpha(shadowColor, 0.1)}`,
};

const foundation: Theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: "light",
    background: {
      paper: "#FFFFFF",
      default: "#F2F2F2",
    },
    primary: {
      main: "#0073E6",
      light: "#2185E9",
      dark: "#0062C3",
      contrastText: "#FFFFFF",
      100: "#C4DCF5",
    },
    secondary: {
      main: "#00C5CA",
      light: "#21CDD1",
      dark: "#00A7AC",
      contrastText: "#FFFFFF",
    },
    pagoPA: {
      main: "#0066CC",
      contrastText: "#fff",
    },
    checkIban: {
      main: "#008CA8",
      contrastText: "#fff",
    },
    europeanUnion: {
      main: "#264CA4",
      contrastText: "#fff",
    },
    indigo: {
      main: indigo[500],
      contrastText: "#fff",
    },
    negative: {
      main: "#FFFFFF",
      contrastText: "#0066CC",
    },
    text: {
      primary: colorTextPrimary,
      secondary: "#5C6F82",
      disabled: "#A2ADB8",
    },
    action: {
      active: "#5C6F82" /* Text/Secondary */,
      hover: "rgba(23, 50, 77, 0.08)" /* Text/Primary 8% */,
      hoverOpacity: 0.08,
      selected: "rgba(23, 50, 77, 0.12)" /* Text/Primary 12% */,
      disabled: "rgba(23, 50, 77, 0.26)" /* Text/Primary 26% */,
      disabledBackground: "rgba(23, 50, 77, 0.12)" /* Text/Primary 12% */,
      focus: "rgba(23, 50, 77, 0.12)" /* Text/Primary 12% */,
    },
    primaryAction: {
      hover: "rgba(0, 115, 230, 0.12)" /* Primary 12% */,
      selected: "rgba(0, 115, 230, 0.08)" /* Primary 8% */,
    },
    /* Other */
    divider: "#E3E7EB",
    /* Indicator/Validation */
    error: {
      main: "#FE6666",
      dark: "#D85757",
      light: "#FE7A7A",
      extraLight: "#FB9EAC",
      contrastText: colorTextPrimary,
      100: "#FFE0E0",
      850: "#761F1F",
    },
    info: {
      main: "#6BCFFB",
      dark: "#5BB0D5",
      light: "#7ED5FC",
      extraLight: "#86E1FD",
      contrastText: colorTextPrimary,
      100: "#E1F5FE",
      850: "#215C76",
    },
    success: {
      main: "#6CC66A",
      dark: "#5CA85A",
      light: "#7FCD7D",
      extraLight: "#B5E2B4",
      contrastText: colorTextPrimary,
      100: "#E1F4E1",
      850: "#224021",
    },
    warning: {
      main: "#FFCB46",
      dark: "#D9AD3C",
      light: "#FFD25E",
      extraLight: "#FFE5A3",
      contrastText: colorTextPrimary,
      100: "#FFF5DA",
      850: "#614C15",
    },
  },
  typography: {
    /* Using a constant because type variants
    don't inherit the typeface general color */
    allVariants: {
      color: colorTextPrimary,
    },
    /* Using a constant because type variants
    don't inherit the typeface font family */
    fontFamily: mainTypeface,
    fontWeightRegular: 400,
    fontWeightMedium: 600 /* Semibold */,
    fontWeightBold: 700,
    fontSize: 16,
    htmlFontSize: 16,
  },
  shadows: { ...shadowsArray, ...shadowValues },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});

const checkoutTheme = createTheme({
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
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
      },
      styleOverrides: {
        root: {
          padding: "0 20px",
          "&.Mui-focusVisible": {
            borderRadius: `${focusBorderRadius}`,
            outline: `solid ${focusWidth} ${foundation.palette.primary.main}`,
            outlineOffset: `${focusButtonOffset}`,
            boxShadow: "none",
          },
          minHeight: pxToRem(24),
          minWidth: pxToRem(24),
          "&.MuiButton-text": {
            "&:hover": {
              backgroundColor: "transparent",
              color: "#0055AA",
            },
          },
          "&.MuiButton-contained": {
            "&:hover": {
              backgroundColor: "#0055AA",
            },
          },
        },
        sizeSmall: {
          height: "40px",
          padding: "0 20px",
          fontSize: pxToRem(14),
          lineHeight: 1.25 /* ~18px */,
        },
        sizeMedium: {
          height: "48px",
          padding: "0 24px",
          fontSize: pxToRem(16),
          lineHeight: 1.25 /* 20px */,
        },
        sizeLarge: {
          height: "56px",
          padding: "0 24px",
          fontSize: pxToRem(18),
          lineHeight: 1.2 /* ~22px */,
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
          "&:disabled": {
            borderWidth: "2px",
          },
        },
        outlinedPrimary: {
          borderColor: foundation.palette.primary.main,
          "&:hover": {
            color: foundation.palette.primary.dark,
            borderColor: "currentColor",
          },
        },
        outlinedError: {
          borderColor: foundation.palette.error.main,
          "&:hover": {
            color: foundation.palette.error.dark,
            borderColor: "currentColor",
          },
          "&.Mui-focusVisible": {
            borderRadius: `${focusBorderRadius}`,
            outline: `solid ${focusWidth} ${foundation.palette.error.main}`,
            outlineOffset: `${focusOffset}`,
            boxShadow: "none",
          },
        },
      },
      variants: [
        {
          props: { variant: "naked" },
          style: {
            color: foundation.palette.text.primary,
            padding: 0,
            height: "auto",
            minWidth: "auto",
            "&:hover": {
              color: alpha(foundation.palette.text.primary, 0.8),
              backgroundColor: "transparent",
            },
            "&.Mui-focusVisible": {
              borderRadius: `${focusBorderRadius}`,
              outline: `solid ${focusWidth} ${foundation.palette.text.primary}`,
              outlineOffset: `${focusOffset}`,
              boxShadow: "none",
            },
          },
        },
        {
          props: { variant: "naked", color: "primary" },
          style: {
            color: foundation.palette.primary.main,
            "&:hover": {
              color: colorPrimaryContainedHover,
            },
            "&.Mui-focusVisible": {
              borderRadius: `${focusBorderRadius}`,
              outline: `solid ${focusWidth} ${foundation.palette.primary.main}`,
              outlineOffset: `${focusButtonOffset}`,
              boxShadow: "none",
            },
          },
        },
        {
          props: { variant: "naked", color: "error" },
          style: {
            color: foundation.palette.error.main,
            "&:hover": {
              color: foundation.palette.error.light,
            },
            "&.Mui-focusVisible": {
              borderRadius: `${focusBorderRadius}`,
              outline: `solid ${focusWidth} ${foundation.palette.error.main}`,
              outlineOffset: `${focusButtonOffset}`,
              boxShadow: "none",
            },
          },
        },
      ],
    },
  },
});

export function App() {
  const { t } = useTranslation();
  const fixedFooterPages = [
    CheckoutRoutes.ROOT,
    CheckoutRoutes.LEGGI_CODICE_QR,
    CheckoutRoutes.SCEGLI_METODO,
    CheckoutRoutes.ANNULLATO,
    CheckoutRoutes.ESITO,
    CheckoutRoutes.ERRORE,
    CheckoutRoutes.SESSIONE_SCADUTA,
    CheckoutRoutes.DONA,
  ];

  React.useEffect(() => {
    mixpanelInit();
  }, []);
  // eslint-disable-next-line functional/immutable-data
  document.title = t("app.title");
  // eslint-disable-next-line functional/immutable-data
  (window as any).recaptchaOptions = {
    useRecaptchaNet: true,
  };

  return (
    <ThemeProvider theme={checkoutTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout fixedFooterPages={fixedFooterPages}>
          <Routes>
            <Route path="/" element={<PaymentOutlet />}>
              <Route path={CheckoutRoutes.ROOT} element={<IndexPage />} />
              <Route
                path={CheckoutRoutes.AUTH_CALLBACK}
                element={<AuthCallback />}
              />
              <Route
                path={CheckoutRoutes.AUTH_EXPIRED}
                element={<AuthExpiredPage />}
              />
              <Route
                path={CheckoutRoutes.DONA}
                element={<DonationPageDismissed />}
              />
              <Route
                path={CheckoutRoutes.LEGGI_CODICE_QR}
                element={<PaymentQrPage />}
              />
              <Route
                path={CheckoutRoutes.INSERISCI_DATI_AVVISO}
                element={<PaymentNoticePage />}
              />
              <Route
                path={CheckoutRoutes.DATI_PAGAMENTO}
                element={
                  <Guard item={SessionItems.paymentInfo}>
                    <PaymentSummaryPage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.INSERISCI_EMAIL}
                element={
                  <NoticeGuard>
                    <PaymentEmailPage />
                  </NoticeGuard>
                }
              />
              <Route
                path={CheckoutRoutes.INSERISCI_CARTA}
                element={
                  <Guard item={SessionItems.useremail}>
                    <IframeCardPage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.SCEGLI_METODO}
                element={
                  <Guard item={SessionItems.useremail}>
                    <PaymentChoicePage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.LISTA_PSP}
                element={
                  <Guard item={SessionItems.transaction}>
                    <PaymentPspListPage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.RIEPILOGO_PAGAMENTO}
                element={
                  <Guard item={SessionItems.transaction}>
                    <PaymentCheckPage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.GDI_CHECK}
                element={
                  <Guard item={SessionItems.orderId}>
                    <GdiCheckPage />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.ESITO}
                element={
                  <Guard item={SessionItems.transaction}>
                    <PaymentResponsePage />
                  </Guard>
                }
              />
              <Route
                path={`v2/${CheckoutRoutes.ESITO}`}
                element={
                  <Guard item={SessionItems.transaction}>
                    <PaymentResponsePageV2 />
                  </Guard>
                }
              />
              <Route
                path={CheckoutRoutes.ANNULLATO}
                element={<CancelledPage />}
              />
              <Route path={CheckoutRoutes.ERRORE} element={<KOPage />} />
              <Route
                path={CheckoutRoutes.SESSIONE_SCADUTA}
                element={<SessionExpiredPage />}
              />
              <Route
                path=":rptid"
                element={
                  <RptidGuard>
                    <PaymentNoticePage />
                  </RptidGuard>
                }
              />
              <Route
                path={`${CheckoutRoutes.CARRELLO}/:cartid`}
                element={
                  // set a guard here to check if cartid matches a regex
                  <PaymentCartPage />
                }
              />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
