import React, { useEffect } from "react";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { useNavigate } from "react-router-dom";
import { onBrowserBackEvent, onBrowserUnload } from "../utils/eventListeners";
import { CheckoutRoutes } from "./models/routeModel";
import { getSessionItem, SessionItems, setSessionItem } from "../utils/storage/sessionStorage";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
      try {
        window.addEventListener("beforeunload", onBrowserUnload);
        window.addEventListener("popstate", onBrowserBackEvent);

        //retrieve auth-code from url
        const searchParams = new URLSearchParams(window.location.search);
        const authCode = searchParams.get("auth-code");

        //if auth code exists save into session storage
        if(authCode != null)
          setSessionItem(SessionItems.authCode, authCode);

        //get last page from session storage
        let redirectPage = getSessionItem(SessionItems.loginOriginPage) as string;

        //if authCode or redirect page is not present redirect to root page
        if(authCode == null || redirectPage == null)
          redirectPage = `/${CheckoutRoutes.ROOT}`;  
  
        //TODO aggiungere chiamata alla POST /auth
        navigate(redirectPage, { replace: true });
        
        return () => {
          window.removeEventListener("popstate", onBrowserBackEvent);
          window.removeEventListener("beforeunload", onBrowserUnload);
        };
      } catch {
        return navigate(`/${CheckoutRoutes.ROOT}`, { replace: true });
      }
    }, []);

  return (
    <PageContainer>
      <CheckoutLoader />
    </PageContainer>
  );
}
