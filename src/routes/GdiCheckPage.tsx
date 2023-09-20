import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import { onBrowserUnload } from "../utils/eventListeners";
import { CheckoutRoutes } from "./models/routeModel";

const GdiCheckPage = () => {
  const navigate = useNavigate();

  const gdiCheckTimeout =
    Number(process.env.CHECKOUT_GDI_CHECK_TIMEOUT) || 12000;

  const gdiIframeUrl = getFragmentParameter(
    window.location.href,
    "gdiIframeUrl"
  );

  useEffect(() => {
    try {
      const onBrowserBackEvent = (e: any) => {
        e.preventDefault();
        window.history.pushState(null, "", window.location.pathname);
      };

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
