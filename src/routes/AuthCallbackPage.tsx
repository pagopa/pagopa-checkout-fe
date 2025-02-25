import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { authentication } from "../utils/api/helper";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { onBrowserBackEvent, onBrowserUnload } from "../utils/eventListeners";
import {
  getAndClearSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import ErrorModal from "../components/modals/ErrorModal";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);

  const onError = (m: string) => {
    window.removeEventListener("popstate", onBrowserBackEvent);
    window.removeEventListener("beforeunload", onBrowserUnload);
    setError(m);
    setErrorModalOpen(true);
  };

  // navigate to last page from session storage
  const returnToOriginPage = () => {
    navigate(
      pipe(
        getAndClearSessionItem(SessionItems.loginOriginPage) as string,
        O.fromNullable,
        O.getOrElse(() => `/${CheckoutRoutes.ROOT}`)
      )
    );
  };

  useEffect(() => {
    try {
      window.addEventListener("beforeunload", onBrowserUnload);
      window.addEventListener("popstate", onBrowserBackEvent);

      // retrieve auth-code from url
      const searchParams = new URLSearchParams(window.location.search);
      const authCode = searchParams.get("auth-code");

      void (async (authCode) => {
        void authentication({
          authCode,
          onResponse: (authToken: string) => {
            setSessionItem(SessionItems.authToken, authToken);
            returnToOriginPage();
          },
          onError,
        });
      })(authCode);

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
      {!!errorModalOpen && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            returnToOriginPage();
          }}
          titleId="iframeCardFormErrorTitleId"
          errorId="iframeCardFormErrorId"
          bodyId="iframeCardFormErrorBodyId"
        />
      )}
    </PageContainer>
  );
}
