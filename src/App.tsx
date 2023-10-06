import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { MuiLoadingButton } from '@mui/lab/themeAugmentation';
import ReadexPro from 'url:./assets/fonts/ReadexPro-Regular.ttf'
import Guard from "./components/commons/Guard";
import { Layout } from "./components/commons/Layout";
import NoticeGuard from "./components/commons/NoticeGuard";
import RptidGuard from "./components/commons/RptidGuard";
import CancelledPage from "./routes/CancelledPage";
import DonationPageDismissed from "./routes/DonationPageDismissed";
import IndexPage from "./routes/IndexPage";
// import InputCardPage from "./routes/InputCardPage";
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
import PaymentSummaryPage from "./routes/PaymentSummaryPage";
import GdiCheckPage from "./routes/GdiCheckPage";
import "./translations/i18n";
import { mixpanelInit } from "./utils/config/mixpanelHelperInit";
import { SessionItems } from "./utils/storage/sessionStorage";

declare const OneTrust: any;
declare const OnetrustActiveGroups: string;
const global = window as any;
// target cookies (Mixpanel)
const targCookiesGroup = "C0004";

const checkoutTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    background: {
      paper: theme.palette.background.default,
      default: theme.palette.background.paper,
    },
    primary: {
      main: "#0B3EE3",
    },
  },

  typography: {
    fontFamily: "Readex Pro",
  },
  components: {
    ...theme.components,
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Readex Pro';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Raleway'), local('Raleway-Regular'), url(${ReadexPro}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiLoadingButton: {
      styleOverrides: {
        loadingIndicator: {
          color: "white !important",
        },
        root: ({ ownerState }) =>
          (ownerState.loading && {
            backgroundColor: "#0B3EE3 !important",
            color: "transparent !important",
          }) ||
          (ownerState.disabled &&
            ownerState.type === "submit" && {
              backgroundColor: "#0B3EE3 !important",
              color: "white !important",
            }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
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
    CheckoutRoutes.DONA,
  ];
  React.useEffect(() => {
    // OneTrust callback at first time
    // eslint-disable-next-line functional/immutable-data
    global.OptanonWrapper = function () {
      OneTrust.OnConsentChanged(function () {
        const activeGroups = OnetrustActiveGroups;
        if (activeGroups.indexOf(targCookiesGroup) > -1) {
          mixpanelInit();
        }
      });
    };
    // check mixpanel cookie consent in cookie
    const OTCookieValue: string =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("OptanonConsent=")) || "";
    const checkValue = `${targCookiesGroup}%3A1`;
    if (OTCookieValue.indexOf(checkValue) > -1) {
      mixpanelInit();
    }
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
                path={CheckoutRoutes.ANNULLATO}
                element={<CancelledPage />}
              />
              <Route path={CheckoutRoutes.ERRORE} element={<KOPage />} />
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
