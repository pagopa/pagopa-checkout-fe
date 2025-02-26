/* eslint-disable sonarjs/cognitive-complexity */
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { HeaderAccount, JwtUser, RootLinkType } from "@pagopa/mui-italia";
import ReCAPTCHA from "react-google-recaptcha";
import { Box } from "@mui/material";
import { proceedToLogin } from "../../utils/api/helper";
import { ErrorsType } from "../../utils/errors/checkErrorsModel";
import { onBrowserUnload } from "../../utils/eventListeners";
import ErrorModal from "../../components/modals/ErrorModal";
import CheckoutLoader from "../../components/PageContent/CheckoutLoader";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import {
  clearSessionItem,
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";

export default function LoginHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const pagoPALink: RootLinkType = {
    label: "PagoPA S.p.A.",
    href: "https://www.pagopa.it",
    ariaLabel: t("mainPage.footer.pagoPA"),
    title: t("mainPage.footer.pagoPA"),
  };
  const loginRoutes: Array<string> = [
    CheckoutRoutes.ROOT,
    CheckoutRoutes.LEGGI_CODICE_QR,
    CheckoutRoutes.INSERISCI_DATI_AVVISO,
    CheckoutRoutes.DATI_PAGAMENTO,
    CheckoutRoutes.INSERISCI_EMAIL,
    CheckoutRoutes.SCEGLI_METODO,
  ];
  const sessionLoggedUser = getSessionItem(SessionItems.loggedUser) as
    | JwtUser
    | undefined;
  const [loggedUser, setLoggedUser] = React.useState<JwtUser | undefined>(
    sessionLoggedUser
  );
  // TODO manage logged user after callback
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onResponse = (authorizationUrl: string) => {
    try {
      setSessionItem(SessionItems.loginOriginPage, window.location.href);
      window.removeEventListener("beforeunload", onBrowserUnload);
      const url = new URL(authorizationUrl);
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.search}`);
        setLoading(false);
      } else {
        window.location.replace(url);
      }
    } catch {
      onError(ErrorsType.GENERIC_ERROR);
    }
  };

  const onLogin = async (recaptchaRef: ReCAPTCHA) => {
    setLoading(true);
    await proceedToLogin({ recaptchaRef, onError, onResponse });
  };

  const handleClickOnLogin = async () => {
    if (ref.current) {
      await onLogin(ref.current);
    }
  };
  const onLogoutClick = () => {
    setLoading(true);
    clearSessionItem(SessionItems.loggedUser);
    setLoggedUser(undefined);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  return (
    <Box component="div" id="login-header">
      {loading && <CheckoutLoader />}
      <HeaderAccount
        rootLink={pagoPALink}
        loggedUser={loggedUser}
        enableDropdown={true}
        userActions={[
          {
            id: "logout",
            icon: <Logout fontSize="small" />,
            label: t("mainPage.header.logout"),
            onClick: onLogoutClick,
          },
        ]}
        enableLogin={loginRoutes.includes(currentPath) || loggedUser != null}
        enableAssistanceButton={false}
        onAssistanceClick={() => {}} // eslint-disable-line @typescript-eslint/no-empty-function
        onLogin={handleClickOnLogin}
      />
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          titleId="idTitleErrorModalPaymentCheckPage"
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
    </Box>
  );
}
