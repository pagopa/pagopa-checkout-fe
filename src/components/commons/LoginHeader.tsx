/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { HeaderAccount, RootLinkType } from "@pagopa/mui-italia";
import ReCAPTCHA from "react-google-recaptcha";
import { Box } from "@mui/material";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { selectMaintenanceEnabled } from "../../redux/slices/maintanancePage";
import { UserLogout } from "../../components/modals/UserLogout";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import {
  getLoggedUser,
  removeLoggedUser,
  setLoggedUser,
} from "../../redux/slices/loggedUser";
import {
  cancelPayment,
  logoutUser,
  proceedToLogin,
  retrieveUserInfo,
} from "../../utils/api/helper";
import { ErrorsType } from "../../utils/errors/checkErrorsModel";
import { onBrowserUnload } from "../../utils/eventListeners";
import ErrorModal from "../../components/modals/ErrorModal";
import CheckoutLoader from "../../components/PageContent/CheckoutLoader";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
  clearSessionItem,
} from "../../utils/storage/sessionStorage";
import { UserInfoResponse } from "../../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce-v3/NewTransactionResponse";
import { CancelPayment } from "../../components/modals/CancelPayment";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
} from "../../utils/mixpanel/mixpanelEvents";

export default function LoginHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
  const loggedUser = useAppSelector(getLoggedUser);
  const maintenanceEnabled = useAppSelector(
    selectMaintenanceEnabled
  ).maintenanceEnabled;
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(false);
  const [isLoginButtonReady, setLoginButtonReady] = React.useState(false);
  const [error, setError] = React.useState("");
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [cancelPaymentModalOpen, setCancelPaymentModalOpen] =
    React.useState(false);
  const [userSessionLogoutModalOpen, setUserSessionLogoutModalOpen] =
    React.useState(false);

  // the login button should be visible if user is already logged in
  // and user is on pages where he cannot do login
  const showLoginButton = (): boolean =>
    !maintenanceEnabled &&
    isLoginButtonReady &&
    (loginRoutes.includes(currentPath) || loggedUser.userInfo != null);

  const hideLoading = () => {
    setLoading(false);
  };

  const onError = (m: string) => {
    hideLoading();
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onResponse = (authorizationUrl: string) => {
    try {
      setSessionItem(
        SessionItems.loginOriginPage,
        `${location.pathname}${location.search}`
      );
      window.removeEventListener("beforeunload", onBrowserUnload);
      const url = new URL(authorizationUrl);
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.search}`, { replace: true });
        hideLoading();
      } else {
        window.location.assign(url);
      }
    } catch {
      onError(ErrorsType.GENERIC_ERROR);
    }
  };

  const onLogin = async (recaptchaRef: ReCAPTCHA) => {
    setLoading(true);
    mixpanel.track(MixpanelEventsId.CHK_LOGIN_REQUEST, {
      EVENT_ID: MixpanelEventsId.CHK_LOGIN_REQUEST,
      EVENT_CATEGORY: MixpanelEventCategory.TECH,
      page: window.location.pathname,
    });
    await proceedToLogin({ recaptchaRef, onError, onResponse });
  };

  const handleClickOnLogin = async () => {
    if (ref.current) {
      await onLogin(ref.current);
    }
  };

  const checkTransactionAndHandleLogout = async () => {
    await pipe(
      getSessionItem(SessionItems.transaction),
      NewTransactionResponse.decode,
      E.fold(
        async () => setUserSessionLogoutModalOpen(true), // no transaction have been created, user can be logged out without canceling transaction
        async () => setCancelPaymentModalOpen(true) // transaction have been created, logout will cancel transaction
      )
    );
  };

  const performUserLogout = async () => {
    await logoutUser({
      onError: () => {
        // eslint-disable-next-line no-console
        console.log("logout KO");
      },
      onResponse: () => {
        // eslint-disable-next-line no-console
        console.log("logout OK");
      },
    });
    clearSessionItem(SessionItems.authToken);
    dispatch(removeLoggedUser());
    setCancelPaymentModalOpen(false);
    setUserSessionLogoutModalOpen(false);
  };

  const cancelPaymentAndLogout = async () => {
    await cancelPayment(
      async () => {
        await performUserLogout();
        navigate(`/${CheckoutRoutes.ERRORE}`);
      },
      async () => {
        await performUserLogout();
        navigate(`/${CheckoutRoutes.ANNULLATO}`);
      }
    );
  };

  const doGetUserInfo = () => {
    void retrieveUserInfo({
      onResponse: (userInfo: UserInfoResponse) => {
        checkAuthTokenAndContinue(() => {
          dispatch(
            setLoggedUser({
              id: `${userInfo.name}${userInfo.familyName}`,
              name: userInfo.name,
              surname: userInfo.familyName,
            })
          );
        });
      },
      onError: () => {
        checkAuthTokenAndContinue(() => {
          navigate(`/${CheckoutRoutes.ERRORE}`);
        });
      },
    });
  };

  const checkAuthTokenAndContinue = (onCheckSuccess: () => void) => {
    pipe(
      getSessionItem(SessionItems.authToken),
      O.fromNullable,
      O.fold(
        // If authToken is not present discard operation
        () => setLoginButtonReady(true),
        // If authToken is present do operation
        () => {
          onCheckSuccess();
          setLoginButtonReady(true);
        }
      )
    );
  };

  useEffect(() => {
    // When go back to redirectUrl from outside and page is cached hide loading
    window.addEventListener("pageshow", hideLoading);

    pipe(
      getSessionItem(SessionItems.authToken),
      O.fromNullable,
      O.fold(() => setLoginButtonReady(true), doGetUserInfo)
    );

    return () => {
      window.removeEventListener("pageshow", hideLoading);
    };
  }, []);

  return (
    <Box component="div" data-testid="login-header" id="login-header">
      {loading && <CheckoutLoader />}
      <HeaderAccount
        rootLink={pagoPALink}
        loggedUser={loggedUser.userInfo}
        enableDropdown={true}
        userActions={[
          {
            id: "logout",
            icon: <Logout id="logout-button-icon" fontSize="small" />,
            label: t("mainPage.header.logout"),
            onClick: checkTransactionAndHandleLogout,
          },
        ]}
        enableLogin={showLoginButton()}
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
      <UserLogout
        open={userSessionLogoutModalOpen}
        onCancel={() => setUserSessionLogoutModalOpen(false)}
        onSubmit={() => performUserLogout()}
      />
      <CancelPayment
        open={cancelPaymentModalOpen}
        onCancel={() => setCancelPaymentModalOpen(false)}
        onSubmit={() => cancelPaymentAndLogout()}
      />
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
