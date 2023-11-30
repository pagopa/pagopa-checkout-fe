import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionItems, setSessionItem } from "../utils/storage/sessionStorage";
import { getBase64Fragment, getFragments } from "../utils/regex/urlUtilities";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import createBuildConfig from "../utils/buildConfig";
import {
  onBrowserUnload,
  onBrowserBackEvent,
  clearNavigationEvents,
} from "../utils/eventListeners";
import {
  CLIENT_TYPE,
  CheckoutRoutes,
  ROUTE_FRAGMENT,
} from "./models/routeModel";

const GdiCheckPage = () => {
  const navigate = useNavigate();

  const gdiCheckTimeout =
    Number(process.env.CHECKOUT_GDI_CHECK_TIMEOUT) || 12000;

  const decodedGdiIframeUrl = getBase64Fragment(
    window.location.href,
    ROUTE_FRAGMENT.GDI_IFRAME_URL
  );

  const { sessionToken, clientId, transactionId } = getFragments(
    ROUTE_FRAGMENT.SESSION_TOKEN,
    ROUTE_FRAGMENT.CLIENT_ID,
    ROUTE_FRAGMENT.TRANSACTION_ID
  );

  useEffect(() => {
    if (sessionToken && clientId === CLIENT_TYPE.IO) {
      setSessionItem(SessionItems.sessionToken, sessionToken);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (clientId === CLIENT_TYPE.IO && decodedGdiIframeUrl && transactionId) {
      const onPaymentComplete = () => {
        clearNavigationEvents();
        window.location.replace(
          `/${CheckoutRoutes.ESITO}#${ROUTE_FRAGMENT.CLIENT_ID}=${clientId}&${ROUTE_FRAGMENT.TRANSACTION_ID}=${transactionId}`
        );
      };

      const onBuildError = () => {
        window.location.replace(`/${CheckoutRoutes.ERRORE}`);
      };

      try {
        // THIS is mandatory cause the Build class is defined in the external library called NPG SDK
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const newBuild = new Build(
          createBuildConfig({
            onChange: () => null,
            onReadyForPayment: () => null,
            onPaymentRedirect: () => null,
            onPaymentComplete,
            onBuildError,
          })
        );
      } catch {
        onBuildError();
      }
    }
  }, [clientId]);

  useEffect(() => {
    try {
      window.addEventListener("beforeunload", onBrowserUnload);
      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", onBrowserBackEvent);

      const timeoutId = setTimeout(
        () => navigate(`/${CheckoutRoutes.ESITO}`, { replace: true }),
        gdiCheckTimeout
      );

      return () => {
        window.removeEventListener("popstate", onBrowserBackEvent);
        window.removeEventListener("beforeunload", onBrowserUnload);
        clearTimeout(timeoutId);
      };
    } catch {
      return navigate(`/${CheckoutRoutes.ERRORE}`, { replace: true });
    }
  }, []);

  return (
    <PageContainer>
      <CheckoutLoader />
      {decodedGdiIframeUrl && (
        <iframe src={decodedGdiIframeUrl} style={{ display: "none" }} />
      )}
    </PageContainer>
  );
};
export default GdiCheckPage;
