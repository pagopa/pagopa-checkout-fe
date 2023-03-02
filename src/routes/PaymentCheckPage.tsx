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
  useTheme,
} from "@mui/material";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import sprite from "../assets/images/app.svg";
import { FormButtons } from "../components/FormButtons/FormButtons";
import { CancelPayment } from "../components/modals/CancelPayment";
import { CustomDrawer } from "../components/modals/CustomDrawer";
import ErrorModal from "../components/modals/ErrorModal";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import SkeletonFieldContainer from "../components/Skeletons/SkeletonFieldContainer";
import ClickableFieldContainer from "../components/TextFormField/ClickableFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import PspFieldContainer from "../components/TextFormField/PspFieldContainer";
import {
  PaymentInfo,
  PaymentMethod,
  PspList,
  PspSelected,
  Transaction,
} from "../features/payment/models/paymentModel";
import { useAppSelector } from "../redux/hooks/hooks";
import { selectCardData } from "../redux/slices/cardData";
import {
  cancelPayment,
  parseDate,
  calculateFees,
  proceedToPayment,
} from "../utils/api/helper";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

const defaultStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderColor: "divider",
  pt: 1,
  pb: 1,
};

const pspContainerStyle = {
  border: "2px solid",
  borderColor: "divider",
  borderRadius: 2,
  pl: 3,
  pr: 3,
  mb: 2,
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function PaymentCheckPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pspEditLoading, setPspEditLoading] = React.useState(false);
  const [pspUpdateLoading, setPspUpdateLoading] = React.useState(false);
  const [payLoading, setPayLoading] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [pspList, setPspList] = React.useState<Array<PspList>>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const cardData = useAppSelector(selectCardData);
  const paymentMethod = getSessionItem(SessionItems.paymentMethod) as
    | PaymentMethod
    | undefined;
  const pspSelected = getSessionItem(SessionItems.pspSelected) as
    | PspSelected
    | undefined;
  const transaction = getSessionItem(SessionItems.transaction) as
    | Transaction
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
    ) + Number(pspSelected?.fee || 0);

  const onBrowserBackEvent = (e: any) => {
    e.preventDefault();
    window.history.pushState(null, "", window.location.pathname);
    setCancelModalOpen(true);
  };

  React.useEffect(() => {
    window.addEventListener("beforeunload", onBrowserUnload);
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", onBrowserBackEvent);
    return () => window.removeEventListener("popstate", onBrowserBackEvent);
  }, []);

  const onError = (m: string) => {
    setPayLoading(false);
    setCancelLoading(false);
    setPspEditLoading(false);
    setPspUpdateLoading(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onResponse = (authorizationUrl: string) => {
    setPayLoading(false);
    window.removeEventListener("beforeunload", onBrowserUnload);
    window.location.replace(authorizationUrl);
  };

  const onSubmit = React.useCallback(() => {
    setPayLoading(true);
    if (transaction) {
      void proceedToPayment(
        {
          transaction,
          cardData: {
            brand: cardData?.brand || "",
            cvv: cardData?.cvv || "",
            pan: cardData?.pan || "",
            holderName: cardData?.cardHolderName || "",
            expiryDate: pipe(
              parseDate(cardData?.expDate),
              O.getOrElse(() => "")
            ),
          },
        },
        onError,
        onResponse
      );
    }
  }, []);

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
    void cancelPayment(onCancelResponse);
  };

  const onPspEditResponse = (list: Array<PspList>) => {
    setPspList(list.sort((a, b) => (a.commission > b.commission ? 1 : -1)));
    setPspEditLoading(false);
  };

  const onPspEditClick = () => {
    setDrawerOpen(true);
    setPspEditLoading(true);
    if (paymentMethod) {
      void calculateFees({
        paymentMethodId: paymentMethod?.paymentMethodId,
        bin: cardData?.pan.substring(0, 8),
        onError,
        onResponsePsp: onPspEditResponse,
      });
    }
  };

  const updateWalletPSP = (psp: PspList) => {
    setDrawerOpen(false);
    setPspUpdateLoading(true);
    setSessionItem(SessionItems.pspSelected, {
      pspCode: psp.idPsp || "",
      fee: psp.commission,
      businessName: psp.name || "",
    });
    setPspUpdateLoading(false);
  };

  const getWalletIcon = () => {
    if (!cardData.brand || cardData.brand.toLowerCase() === "other") {
      return <CreditCardIcon color="action" />;
    }
    return (
      <SvgIcon color="action">
        <use href={sprite + `#icons-${cardData.brand.toLowerCase()}-mini`} />
      </SvgIcon>
    );
  };

  const isDisabled = () =>
    pspEditLoading || payLoading || cancelLoading || pspUpdateLoading;

  const isDisabledSubmit = () => isDisabled() || pspSelected?.pspCode === "";

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
        title={`· · · · ${cardData.pan.slice(-4)}`}
        body={`${cardData.expDate.slice(0, 2)}/${cardData.expDate.slice(
          3,
          5
        )} · ${cardData.cardHolderName}`}
        icon={getWalletIcon()}
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
            onClick={() => navigate(`/${CheckoutRoutes.INSERISCI_CARTA}`)}
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
        title={(pspSelected && moneyFormat(pspSelected.fee)) || ""}
        body={
          (pspSelected &&
            `${t("paymentCheckPage.psp")} ${pspSelected.businessName}`) ||
          ""
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

      <CustomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            pt: 1,
            pb: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6" component={"div"}>
            {t("paymentCheckPage.drawer.title")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            {t("paymentCheckPage.drawer.body")}
          </Typography>
          <Box
            sx={{
              ...defaultStyle,
              borderBottom: "1px solid",
              borderBottomColor: "divider",
              pt: 3,
              pb: 2,
            }}
          >
            <Typography
              variant={"caption-semibold"}
              component={"div"}
              aria-hidden="true"
            >
              {t("paymentCheckPage.drawer.header.name")}
            </Typography>
            <Typography
              variant={"caption-semibold"}
              component={"div"}
              aria-hidden="true"
            >
              {t("paymentCheckPage.drawer.header.amount")}
            </Typography>
          </Box>
        </Box>
        {pspEditLoading
          ? Array(3)
              .fill(1)
              .map((_, index) => (
                <SkeletonFieldContainer key={index} sx={pspContainerStyle} />
              ))
          : pspList.map((psp, index) => (
              <PspFieldContainer
                key={index}
                titleVariant="sidenav"
                bodyVariant="body2"
                image={psp.image}
                body={psp.name}
                sx={{
                  ...pspContainerStyle,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    borderColor: "currentColor",
                  },
                }}
                endAdornment={
                  <Typography
                    variant={"button"}
                    color="primary"
                    component={"div"}
                  >
                    {moneyFormat(psp.commission / 100, 0)}
                  </Typography>
                }
                onClick={() => {
                  updateWalletPSP(psp);
                }}
              />
            ))}
      </CustomDrawer>

      {!!error && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
    </PageContainer>
  );
}
