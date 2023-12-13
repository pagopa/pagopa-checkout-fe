import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNpgSdk } from "../hooks/useNpgSdk";
import { SessionItems, setSessionItem } from "../utils/storage/sessionStorage";
import { getBase64Fragment, getFragments } from "../utils/regex/urlUtilities";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
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

  const esitoPath =
    clientId === CLIENT_TYPE.IO
      ? `/${CheckoutRoutes.ESITO}#${ROUTE_FRAGMENT.CLIENT_ID}=${clientId}&${ROUTE_FRAGMENT.TRANSACTION_ID}=${transactionId}`
      : `/${CheckoutRoutes.ESITO}`;

  const onPaymentComplete = () => {
    clearNavigationEvents();
    window.location.replace(esitoPath);
  };

  const onBuildError = () => {
    window.location.replace(`/${CheckoutRoutes.ERRORE}`);
  };

  const onPaymentRedirect = (urlredirect: string) => {
    clearNavigationEvents();
    window.location.replace(urlredirect);
  };

  const { buildSdk, sdkReady } = useNpgSdk({
    onPaymentComplete,
    onBuildError,
    onPaymentRedirect,
  });

  useEffect(() => {
    if (
      clientId === CLIENT_TYPE.IO &&
      sdkReady &&
      decodedGdiIframeUrl &&
      transactionId &&
      sessionToken
    ) {
      setSessionItem(SessionItems.sessionToken, sessionToken);
      buildSdk();
    }
  }, [clientId, sdkReady, decodedGdiIframeUrl, transactionId, sessionToken]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => navigate(esitoPath, { replace: true }),
      gdiCheckTimeout
    );
    if (!clientId || clientId !== CLIENT_TYPE.IO) {
      window.addEventListener("beforeunload", onBrowserUnload);
      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", onBrowserBackEvent);

      return () => {
        window.removeEventListener("popstate", onBrowserBackEvent);
        clearTimeout(timeoutId);
        window.removeEventListener("beforeunload", onBrowserUnload);
      };
    }
    return () => {
      clearTimeout(timeoutId);
    };
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
