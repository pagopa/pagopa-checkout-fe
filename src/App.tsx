import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@pagopa/mui-italia";
import React from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Guard from "./components/commons/Guard";
import { Layout } from "./components/commons/Layout";
import RptidGuard from "./components/commons/RptidGuard";
import CancelledPage from "./routes/CancelledPage";
import DonationPage from "./routes/DonationPage";
import IndexPage from "./routes/IndexPage";
import InputCardPage from "./routes/InputCardPage";
import KOPage from "./routes/KOPage";
import { CheckoutRoutes } from "./routes/models/routeModel";
import PaymentCheckPage from "./routes/PaymentCheckPage";
import PaymentChoicePage from "./routes/PaymentChoicePage";
import PaymentEmailPage from "./routes/PaymentEmailPage";
import PaymentNoticePage from "./routes/PaymentNoticePage";
import PaymentOutlet from "./routes/PaymentOutlet";
import PaymentQrPage from "./routes/PaymentQrPage";
import PaymentResponsePage from "./routes/PaymentResponsePage";
import PaymentSummaryPage from "./routes/PaymentSummaryPage";
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
              <Route path="" element={<IndexPage />} />
              <Route path="dona" element={<DonationPage />} />
              <Route path="leggi-codice-qr" element={<PaymentQrPage />} />
              <Route
                path="inserisci-dati-avviso"
                element={<PaymentNoticePage />}
              />
              <Route
                path="dati-pagamento"
                element={
                  <Guard item={SessionItems.paymentInfo}>
                    <PaymentSummaryPage />
                  </Guard>
                }
              />
              <Route
                path="inserisci-email"
                element={
                  <Guard item={SessionItems.paymentInfo}>
                    <PaymentEmailPage />
                  </Guard>
                }
              />
              <Route
                path="inserisci-carta"
                element={
                  <Guard item={SessionItems.useremail}>
                    <InputCardPage />
                  </Guard>
                }
              />
              <Route
                path="scegli-metodo"
                element={
                  <Guard item={SessionItems.paymentId}>
                    <PaymentChoicePage />
                  </Guard>
                }
              />
              <Route
                path="riepilogo-pagamento"
                element={
                  <Guard item={SessionItems.paymentId}>
                    <PaymentCheckPage />
                  </Guard>
                }
              />
              <Route
                path="esito"
                element={
                  <Guard item={SessionItems.paymentId}>
                    <PaymentResponsePage />
                  </Guard>
                }
              />
              <Route path="annullato" element={<CancelledPage />} />
              <Route path="errore" element={<KOPage />} />
              <Route
                path=":rptid"
                element={
                  <RptidGuard>
                    <PaymentNoticePage />
                  </RptidGuard>
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
