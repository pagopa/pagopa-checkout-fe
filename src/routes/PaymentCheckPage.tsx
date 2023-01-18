/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
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
import { PspList, Wallet } from "../features/payment/models/paymentModel";
import { useAppSelector } from "../redux/hooks/hooks";
import { selectSecurityCode } from "../redux/slices/securityCode";
import {
  getCheckData,
  getEmailInfo,
  getPaymentInfo,
  getWallet,
} from "../utils/api/apiService";
import {
  cancelPayment,
  confirmPayment,
  getPaymentPSPList,
  updateWallet,
} from "../utils/api/helper";
import { onBrowserUnload } from "../utils/eventListeners";
import { moneyFormat } from "../utils/form/formatters";
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

const AmountDisclaimer = ({ amount }: { amount: number }) => {
  const { t } = useTranslation();
  const disclaimer =
    amount < 50
      ? "Suggerito perché il più economico"
      : "Perché gestisce la tua carta";
  return (
    <Typography
      variant="caption-semibold"
      component="div"
      sx={{
        overflowWrap: "anywhere",
      }}
    >
      {t(disclaimer)}
    </Typography>
  );
};

const WalletIcon = ({ wallet }: { wallet: Wallet }) => {
  if (
    !wallet.creditCard.brand ||
    wallet.creditCard.brand.toLowerCase() === "other"
  ) {
    return <CreditCardIcon color="action" />;
  }
  return (
    <SvgIcon color="action">
      <use
        href={sprite + `#icons-${wallet.creditCard.brand.toLowerCase()}-mini`}
      />
    </SvgIcon>
  );
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

  const cvv = useAppSelector(selectSecurityCode);
  const checkData = getCheckData();
  const wallet = getWallet();
  const email = getEmailInfo();
  const totalAmount = checkData.amount.amount + wallet.psp.fixedCost.amount;
  const amount = getPaymentInfo().amount;

  React.useEffect(() => {
    const onBrowserBackEvent = (e: any) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
      setCancelModalOpen(true);
    };

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

  const onSubmit = () => {
    setPayLoading(true);
    void confirmPayment({ checkData, wallet, cvv }, onError, () => {
      setPayLoading(false);
      navigate(`/${CheckoutRoutes.ESITO}`);
    });
  };

  const onCancel = () => {
    setCancelModalOpen(true);
  };

  const onCancelPaymentSubmit = () => {
    setCancelModalOpen(false);
    setCancelLoading(true);
    void cancelPayment(onError, () => {
      setCancelLoading(false);
      navigate(`/${CheckoutRoutes.ANNULLATO}`);
    });
  };

  const onPspEditClick = () => {
    setDrawerOpen(true);
    setPspEditLoading(true);
    void getPaymentPSPList({
      onError,
      onResponse: (list: Array<PspList>) => {
        setPspList(list.sort((a, b) => (a.commission > b.commission ? 1 : -1)));
        setPspEditLoading(false);
      },
    });
  };

  const updateWalletPSP = (id: number) => {
    setDrawerOpen(false);
    setPspUpdateLoading(true);
    void updateWallet(id, onError, () => {
      setPspUpdateLoading(false);
    });
  };

  const isDisabled = () =>
    pspEditLoading || payLoading || cancelLoading || pspUpdateLoading;

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
        title={`· · · · ${wallet.creditCard.pan.slice(-4)}`}
        body={`${wallet.creditCard.expireMonth}/${wallet.creditCard.expireYear} · ${wallet.creditCard.holder}`}
        icon={<WalletIcon wallet={wallet} />}
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
        title={moneyFormat(wallet.psp.fixedCost.amount)}
        body={`${t("paymentCheckPage.psp")} ${wallet.psp.businessName}`}
        disclaimer={
          <AmountDisclaimer
            amount={
              checkData.amount.amount /
              Math.pow(10, checkData.amount.decimalDigits)
            }
          />
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
        title={`${t("paymentCheckPage.email")} ${email.email}`}
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
        disabledSubmit={isDisabled()}
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
                    {moneyFormat(psp.commission, 0)}
                  </Typography>
                }
                onClick={() => {
                  updateWalletPSP(psp.idPsp || 0);
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
