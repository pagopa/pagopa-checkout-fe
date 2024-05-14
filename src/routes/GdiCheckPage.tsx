import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import { onBrowserUnload, onBrowserBackEvent } from "../utils/eventListeners";
import { CheckoutRoutes, ROUTE_FRAGMENT } from "./models/routeModel";

const GdiCheckPage = () => {
  const navigate = useNavigate();

  const gdiCheckTimeout =
    Number(process.env.CHECKOUT_GDI_CHECK_TIMEOUT) || 300000;

  const gdiIframeUrl = getFragmentParameter(
    window.location.href,
    ROUTE_FRAGMENT.GDI_IFRAME_URL
  );

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
