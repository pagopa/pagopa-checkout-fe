import CssBaseline from "@mui/material/CssBaseline";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { evaluateFeatureFlag } from "./utils/api/helper";
import featureFlags from "./utils/featureFlags";
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
import { SessionItems } from "./utils/storage/sessionStorage";
import SessionExpiredPage from "./routes/SessionExpiredPage";
import AuthCallback from "./routes/AuthCallbackPage";
import AuthExpiredPage from "./routes/AuthExpiredPage";
import {
  ThemeContext,
  ThemeContextProvider,
  ThemeModes,
} from "./components/themeContextProvider/themeContextProvider";
import PaymentPspListPage from "./routes/PaymentPspListPage";
import MaintenancePage from "./routes/MaintenancePage";

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
  const { mode, toggleTheme } = useContext(ThemeContext);

  const onFeatureFlagError = (e: string) => {
    // eslint-disable-next-line no-console
    console.error(
      "Error while getting feature flag " + SessionItems.enablePspPage,
      e
    );
  };

  const onFeatureFlagSuccess = (data: { enabled: boolean }) => {
    // we need to use localstorage to be permanent in case of page refreshes
    // which happen after entering the credit card data
    localStorage.setItem(SessionItems.enablePspPage, data.enabled.toString());
  };

  const initFeatureFlag = async () => {
    // we need to always evaluate this flag since is stored in the local storage
    await evaluateFeatureFlag(
      featureFlags.enablePspPage,
      onFeatureFlagError,
      onFeatureFlagSuccess
    );
  };

  // / Very raw check on the session storage to check if we have to use the dark mode
  const checkThemeDarkMode = () => {
    const themeModeValue = localStorage.getItem(SessionItems.activeTheme);
    if (
      (themeModeValue === ThemeModes.DARK && mode !== ThemeModes.DARK) ||
      (themeModeValue === ThemeModes.LIGHT && mode !== ThemeModes.LIGHT)
    ) {
      toggleTheme();
    }
  };

  React.useEffect(() => {
    void initFeatureFlag();
    checkThemeDarkMode();
  }, []);

  // eslint-disable-next-line functional/immutable-data
  document.title = t("app.title");
  // eslint-disable-next-line functional/immutable-data
  (window as any).recaptchaOptions = {
    useRecaptchaNet: true,
  };

  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <Layout fixedFooterPages={fixedFooterPages}>
          <Routes>
            <Route path="/" element={<PaymentOutlet />}>
              <Route path={CheckoutRoutes.ROOT} element={<IndexPage />} />
               <Route
                path={CheckoutRoutes.MAINTENANCE}
                element={<MaintenancePage />}
              />
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
    </ThemeContextProvider>
  );
}
