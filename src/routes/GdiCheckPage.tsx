import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import createBuildConfig from "../utils/buildConfig";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
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

  const gdiIframeUrl = getFragmentParameter(
    window.location.href,
    ROUTE_FRAGMENT.GDI_IFRAME_URL
  );

  const clientId = getFragmentParameter(
    window.location.href,
    ROUTE_FRAGMENT.CLIENT_ID
  );

  useEffect(() => {
    if (clientId === CLIENT_TYPE.IO) {
      const onPaymentComplete = () => {
        clearNavigationEvents();
        window.location.replace(
          `/${CheckoutRoutes.ESITO}#${ROUTE_FRAGMENT.CLIENT_ID}=${clientId}`
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
  }, []);

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
      <iframe src={gdiIframeUrl} style={{ display: "none" }} />
    </PageContainer>
  );
};
export default GdiCheckPage;
