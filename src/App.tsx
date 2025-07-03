import CssBaseline from "@mui/material/CssBaseline";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "./utils/storage/sessionStorage";
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
import MaintenanceGuard from "./components/commons/MaintenanceGuard";
import { useFeatureFlagsAll } from "./hooks/useFeatureFlags";
import featureFlags from "./utils/featureFlags";

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

  // Prevents initial UI render before feature flags are loaded,
  // avoiding flicker when MaintenancePage should be shown.
  const [loadingFlags, setLoadingFlags] = React.useState(true);

  const [isMaintenanceEnabled, setIsMaintenanceEnabled] =
    React.useState<boolean>(
      getSessionItem(SessionItems.enableMaintenance) === "true"
    );

  const { checkFeatureFlagAll } = useFeatureFlagsAll();

  const initFeatureFlag = async () => {
    try {
      const allFlags = await checkFeatureFlagAll();
      if (featureFlags[SessionItems.enablePspPage] in allFlags) {
        const enabled = allFlags.isPspPickerPageEnabled;
        localStorage.setItem(SessionItems.enablePspPage, enabled.toString());
      }
      if (featureFlags[SessionItems.enableAuthentication] in allFlags) {
        const enabled = allFlags.isAuthenticationEnabled;
        setSessionItem(SessionItems.enableAuthentication, enabled.toString());
      }
      if (featureFlags[SessionItems.enableMaintenance] in allFlags) {
        const enabled = allFlags.isMaintenancePageEnabled;
        setSessionItem(SessionItems.enableMaintenance, enabled.toString());
        setIsMaintenanceEnabled(enabled);
      }
      if (
        featureFlags[SessionItems.enableScheduledMaintenanceBannerEnabled] in
        allFlags
      ) {
        const enabled = allFlags.enableScheduledMaintenanceBannerEnabled;
        setSessionItem(
          SessionItems.enableScheduledMaintenanceBannerEnabled,
          enabled.toString()
        );
      }
    } finally {
      setLoadingFlags(false); // Even if it fails, complete the loading state
    }
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
      {loadingFlags ? null : (
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Layout fixedFooterPages={fixedFooterPages}>
            {isMaintenanceEnabled ? (
              <MaintenancePage />
            ) : (
              <Routes>
                <Route path="/" element={<PaymentOutlet />}>
                  <Route path={CheckoutRoutes.ROOT} element={<IndexPage />} />
                  <Route
                    path={CheckoutRoutes.MAINTENANCE}
                    element={
                      // This guard ensures the route is accessible only when the maintenance feature flag is active
                      <MaintenanceGuard>
                        <MaintenancePage />
                      </MaintenanceGuard>
                    }
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
            )}
          </Layout>
        </BrowserRouter>
      )}
    </ThemeContextProvider>
  );
}
