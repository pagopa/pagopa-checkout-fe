/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Box,
  Button,
  Link,
  Skeleton,
  SvgIcon,
  Typography,
} from "@mui/material";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { selectThreshold } from "../redux/slices/threshold";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import sprite from "../assets/images/app.svg";
import { FormButtons } from "../components/FormButtons/FormButtons";
import { CancelPayment } from "../components/modals/CancelPayment";
import ErrorModal from "../components/modals/ErrorModal";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import ClickableFieldContainer from "../components/TextFormField/ClickableFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  Cart,
  PaymentInfo,
  PaymentMethod,
  PaymentMethodInfo,
} from "../features/payment/models/paymentModel";
import { useAppSelector } from "../redux/hooks/hooks";
import {
  cancelPayment,
  calculateFees,
  proceedToPayment,
} from "../utils/api/helper";
import { onBrowserUnload, onBrowserBackEvent } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { PaymentPspDrawer } from "../features/payment/components/PaymentPspDrawer/PaymentPspDrawer";
import disclaimerIcon from "../assets/images/disclaimer.svg";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { CalculateFeeResponse } from "../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import { SessionPaymentMethodResponse } from "../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { ImageComponent } from "../features/payment/components/PaymentChoice/PaymentMethodImage";
import { CheckoutRoutes } from "./models/routeModel";

const defaultStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderColor: "divider",
  pt: 1,
  pb: 1,
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function PaymentCheckPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showDisclaimer, setShowDisclaimer] = React.useState(true);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pspEditLoading, setPspEditLoading] = React.useState(false);
  const [pspUpdateLoading, setPspUpdateLoading] = React.useState(false);
  const [payLoading, setPayLoading] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [pspList, setPspList] = React.useState<Array<Bundle>>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [userCancelRedirect, setUserCancelRedirect] = React.useState(false);
  const [errorKOPage, setErrorKOPage] = React.useState("/");
  const [error, setError] = React.useState("");
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const threshold = useAppSelector(selectThreshold);
  const paymentMethod = getSessionItem(SessionItems.paymentMethod) as
    | PaymentMethod
    | undefined;
  const paymentMethodInfo = getSessionItem(SessionItems.paymentMethodInfo) as
    | PaymentMethodInfo
    | undefined;
  const pspSelected = getSessionItem(SessionItems.pspSelected) as
    | Bundle
    | undefined;
  const transaction = getSessionItem(SessionItems.transaction) as
    | NewTransactionResponse
    | undefined;
  const email = getSessionItem(SessionItems.useremail) as string | undefined;
  const amount =
    (getSessionItem(SessionItems.paymentInfo) as PaymentInfo | undefined)
      ?.amount || 0;
  const totalAmount =
    Number(
      transaction?.payments
        .map((p) => p.amount)
        .reduce((sum, current) => sum + current, 0)
    ) + Number(pspSelected?.taxPayerFee || 0);

  const sessionPaymentMethodResponse = getSessionItem(
    SessionItems.sessionPaymentMethod
  ) as SessionPaymentMethodResponse;

  React.useEffect(() => {
    if (!pspSelected?.onUs) {
      setShowDisclaimer(false);
    }
    const onBack = (e: any) => {
      onBrowserBackEvent(e);
      setCancelModalOpen(true);
    };
    window.addEventListener("beforeunload", onBrowserUnload);
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);

  const onError = (m: string, userCancelRedirect?: boolean) => {
    setPayLoading(false);
    setCancelLoading(false);
    setPspEditLoading(false);
    setPspUpdateLoading(false);
    setError(m);
    setErrorModalOpen(true);
    if (userCancelRedirect !== undefined) {
      setUserCancelRedirect(
        userCancelRedirect === undefined ? false : userCancelRedirect
      );
      setErrorKOPage(
        (getSessionItem(SessionItems.cart) as Cart | undefined)?.returnUrls
          .returnErrorUrl || "/"
      );
    }
  };

  const missingThreshold = () => threshold?.belowThreshold === undefined;

  React.useEffect(() => {
    if (missingThreshold()) {
      onCardEdit();
    }
  }, [threshold]);

  const onResponse = (authorizationUrl: string) => {
    try {
      window.removeEventListener("beforeunload", onBrowserUnload);
      const url = new URL(authorizationUrl);
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.hash}`);
        setPayLoading(false);
      } else {
        window.location.replace(url);
      }
    } catch {
      onError(ErrorsType.GENERIC_ERROR);
    }
  };

  const onSubmit = React.useCallback(async () => {
    setPayLoading(true);
    if (transaction) {
      await proceedToPayment(transaction, onError, onResponse);
    } else {
      onError(ErrorsType.GENERIC_ERROR);
    }
  }, []);

  const onCardEdit = () => {
    window.removeEventListener("beforeunload", onBrowserUnload);
    navigate(`/${CheckoutRoutes.SCEGLI_METODO}`, { replace: true });
  };

  const onCancel = React.useCallback(() => {
    setCancelModalOpen(true);
  }, []);

  const onCancelResponse = () => {
    setCancelLoading(false);
    navigate(`/${CheckoutRoutes.ANNULLATO}`);
  };

  const onCancelPaymentSubmit = () => {
    setCancelModalOpen(false);
    setCancelLoading(true);
    void cancelPayment(onError, onCancelResponse);
  };

  const onPspEditResponse = (calculateFeeResponse: any) => {
    pipe(
      calculateFeeResponse,
      CalculateFeeResponse.decode,
      O.fromEither,
      O.fold(
        () => onError(ErrorsType.GENERIC_ERROR),
        (resp) => {
          setPspList(resp?.bundles?.slice() || []);
          setPspEditLoading(false);
        }
      )
    );
  };

  const onPspEditClick = () => {
    setDrawerOpen(true);
    setPspEditLoading(true);
    setShowDisclaimer(false);
    if (paymentMethod) {
      void calculateFees({
        paymentId: paymentMethod?.paymentMethodId,
        bin: sessionPaymentMethodResponse?.bin,
        onError,
        onPspNotFound,
        onResponsePsp: onPspEditResponse,
      });
    }
  };

  const onPspNotFound = () => {
    setPayLoading(false);
    setCancelLoading(false);
    setPspEditLoading(false);
    setPspUpdateLoading(false);
    // setError(m);
    setPspNotFoundModalOpen(true);
  };

  const updatePSP = (psp: Bundle) => {
    setDrawerOpen(false);
    setPspUpdateLoading(true);
    setSessionItem(SessionItems.pspSelected, psp);
    setPspUpdateLoading(false);
  };

  const isDisabled = () =>
    pspEditLoading || payLoading || cancelLoading || pspUpdateLoading;

  const isDisabledSubmit = () =>
    isDisabled() || pspSelected?.idPsp === "" || missingThreshold();

  return (
    <PageContainer>
      <Box
        sx={{
          ...defaultStyle,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Typography variant="h6" component={"div"} pr={2}>
          {t("paymentCheckPage.total")}
        </Typography>
        {pspUpdateLoading ? (
          <Skeleton variant="text" width="110px" height="40px" />
        ) : (
          <Typography variant="h6" component={"div"}>
            {moneyFormat(totalAmount)}
          </Typography>
        )}
      </Box>
      <ClickableFieldContainer
        title="paymentCheckPage.creditCard"
        icon={<CreditCardIcon sx={{ color: "text.primary" }} />}
        clickable={false}
        sx={{ borderBottom: "", mt: 2 }}
        itemSx={{ pl: 0, pr: 0, gap: 2 }}
      />
      <FieldContainer
        titleVariant="sidenav"
        bodyVariant="body2"
        title={paymentMethodInfo?.title || ""}
        body={paymentMethodInfo?.body || ""}
        icon={
          paymentMethodInfo?.icon ? (
            <WalletIcon brand={paymentMethodInfo.icon} />
          ) : (
            <ImageComponent
              asset={paymentMethodInfo?.asset}
              name={paymentMethodInfo?.title || ""}
            />
          )
        }
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          pl: 3,
          pr: 1,
        }}
        endAdornment={
          <Button
            variant="text"
            onClick={onCardEdit}
            startIcon={<EditIcon />}
            disabled={isDisabled()}
            aria-label={t("ariaLabels.editCard")}
          >
            {t("clipboard.edit")}
          </Button>
        }
      />
      <ClickableFieldContainer
        title="paymentCheckPage.transaction"
        icon={<LocalOfferIcon sx={{ color: "text.primary" }} />}
        clickable={false}
        sx={{ borderBottom: "", mt: 2 }}
        itemSx={{ pl: 0, pr: 0, gap: 2 }}
        endAdornment={
          <InfoOutlinedIcon
            sx={{ color: "primary.main", cursor: "pointer" }}
            fontSize="medium"
            onClick={() => {
              setModalOpen(true);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                setModalOpen(true);
              }
            }}
            tabIndex={0}
            aria-label={t("ariaLabels.informationDialog")}
            role="dialog"
          />
        }
      />
      <FieldContainer
        loading={pspUpdateLoading}
        titleVariant="sidenav"
        bodyVariant="body2"
        title={(pspSelected && moneyFormat(pspSelected.taxPayerFee || 0)) || ""}
        body={
          (pspSelected &&
            `${t("paymentCheckPage.psp")} ${pspSelected.pspBusinessName}`) ||
          ""
        }
        disclaimer={pipe(
          threshold.belowThreshold,
          O.fromNullable,
          O.filter(() => showDisclaimer),
          O.map((threshold) => (
            <AmountDisclaimer
              key={1}
              belowThreshold={threshold}
            ></AmountDisclaimer>
          )),
          O.toNullable
        )}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          pl: 3,
          pr: 1,
        }}
        endAdornment={
          <Button
            id="pspEdit"
            variant="text"
            onClick={onPspEditClick}
            startIcon={<EditIcon />}
            disabled={isDisabled()}
            aria-label={t("ariaLabels.editPsp")}
          >
            {t("clipboard.edit")}
          </Button>
        }
      />
      <ClickableFieldContainer
        title={`${t("paymentCheckPage.email")} ${email}`}
        icon={<MailOutlineIcon sx={{ color: "text.primary" }} />}
        clickable={false}
        sx={{ borderBottom: "", mt: 2 }}
        itemSx={{ pl: 2, pr: 0, gap: 2 }}
        variant="body2"
      />
      <FormButtons
        loadingSubmit={payLoading}
        loadingCancel={cancelLoading}
        submitTitle={`${t("paymentCheckPage.buttons.submit")} ${moneyFormat(
          totalAmount
        )}`}
        cancelTitle="paymentCheckPage.buttons.cancel"
        disabledSubmit={isDisabledSubmit()}
        disabledCancel={isDisabled()}
        handleSubmit={onSubmit}
        handleCancel={onCancel}
        idSubmit="paymentCheckPageButtonPay"
        idCancel="paymentCheckPageButtonCancel"
      />
      <InformationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        hideIcon={true}
      >
        <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
          {t("paymentCheckPage.modal.title")}
        </Typography>
        <Typography
          variant="body1"
          component={"div"}
          sx={{ whiteSpace: "pre-line" }}
        >
          {t("paymentCheckPage.modal.body")}
          <Link
            href={`https://www.pagopa.gov.it/it/cittadini/trasparenza-costi/?amount=${amount}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("paymentCheckPage.modal.link")}
          </Link>
          {"."}
        </Typography>
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={() => setModalOpen(false)}>
            {t("errorButton.close")}
          </Button>
        </Box>
      </InformationModal>
      <CancelPayment
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onSubmit={onCancelPaymentSubmit}
      />
      <PaymentPspDrawer
        pspList={pspList}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={pspEditLoading}
        onSelect={updatePSP}
      />
      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          titleId="idTitleErrorModalPaymentCheckPage"
          onClose={() => {
            setErrorModalOpen(false);
            if (userCancelRedirect) {
              navigate(errorKOPage);
            }
          }}
        />
      )}
      {!!pspNotFoundModal && (
        <InformationModal
          open={pspNotFoundModal}
          onClose={() => {
            setPspNotFoundModalOpen(false);
            window.location.replace(`/${CheckoutRoutes.SCEGLI_METODO}`);
          }}
          maxWidth="sm"
          hideIcon={true}
        >
          <Typography
            variant="h6"
            component={"div"}
            sx={{ pb: 2 }}
            id="pspNotFoundTitleId"
          >
            {t("pspUnavailable.title")}
          </Typography>
          <Typography
            variant="body1"
            component={"div"}
            sx={{ whiteSpace: "pre-line" }}
            id="pspNotFoundBodyId"
          >
            {t("pspUnavailable.body")}
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => {
                setPspNotFoundModalOpen(false);
                window.location.replace(`/${CheckoutRoutes.SCEGLI_METODO}`);
              }}
              id="pspNotFoundCtaId"
            >
              {t("pspUnavailable.cta.primary")}
            </Button>
          </Box>
        </InformationModal>
      )}
    </PageContainer>
  );
}

const AmountDisclaimer = ({ belowThreshold }: { belowThreshold: boolean }) => {
  const { t } = useTranslation();
  const disclaimer = belowThreshold
    ? t("paymentCheckPage.disclaimer.cheaper")
    : t("paymentCheckPage.disclaimer.yourCard");
  return (
    <Box display="flex" alignItems="center" flexDirection="row" gap={1} pt={1}>
      <img
        src={disclaimerIcon}
        alt="disclaimer-icon"
        style={{ width: "14px", height: "14px" }}
      />
      <Typography
        id="pspDisclaimer"
        variant="caption-semibold"
        component="div"
        sx={{
          overflowWrap: "anywhere",
        }}
      >
        {t(disclaimer)}
      </Typography>
    </Box>
  );
};

const WalletIcon = ({ brand }: { brand: string }) => {
  if (!brand || brand.toLowerCase() === "other") {
    return <CreditCardIcon color="action" />;
  }
  return (
    <SvgIcon color="action">
      <use href={sprite + `#icons-${brand.toLowerCase()}-mini`} />
    </SvgIcon>
  );
};
