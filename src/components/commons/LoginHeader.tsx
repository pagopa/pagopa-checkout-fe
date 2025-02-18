/* eslint-disable sonarjs/cognitive-complexity */
import React from "react";
import { useLocation } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { HeaderAccount, JwtUser, RootLinkType } from "@pagopa/mui-italia";
import CheckoutLoader from "../../components/PageContent/CheckoutLoader";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import {
  clearSessionItem,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";

export default function LoginHeader() {
  const { t } = useTranslation();
  const location = useLocation();
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
  const [loading, setLoading] = React.useState(false);
  const onAssistanceClick = () => {
    // console.log("Clicked/Tapped on Assistance");
  };
  const onLoginClick = () => {
    setLoading(true);
    const user = {
      id: "1234546",
      email: "email@test.com",
      name: "Mario",
      surname: "Rossi",
    };
    setSessionItem(SessionItems.loggedUser, user);
    setLoggedUser(user);
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  };
  const onLogoutClick = () => {
    setLoading(true);
    clearSessionItem(SessionItems.loggedUser);
    setLoggedUser(undefined);
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  };
  return (
    <>
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
        onAssistanceClick={onAssistanceClick}
        onLogin={onLoginClick}
      />
    </>
  );
}
