import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EuroIcon from "@mui/icons-material/Euro";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Button, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { FormButtons } from "../components/FormButtons/FormButtons";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  PaymentFormFields,
  PaymentInfo,
} from "../features/payment/models/paymentModel";
import { moneyFormat } from "../utils/form/formatters";
import { getSessionItem, SessionItems } from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentSummaryPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  const noticeInfo = getSessionItem(SessionItems.noticeInfo) as
    | PaymentFormFields
    | undefined;
  const [modalOpen, setModalOpen] = React.useState(false);

  const iconStyle = { ml: 3, color: theme.palette.text.secondary };

  const onSubmit = React.useCallback(async () => {
    navigate(`/${CheckoutRoutes.INSERISCI_EMAIL}`);
  }, []);

  const handleInfoClick = () => setModalOpen(true);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setModalOpen(true);
    }
  };
  const handleClose = () => setModalOpen(false);

  return (
    <PageContainer title="paymentSummaryPage.title" childrenSx={{ pt: 2 }}>
      {!!paymentInfo?.paName && (
        <FieldContainer
          title="paymentSummaryPage.creditor"
          body={paymentInfo.paName}
          icon={<AccountBalanceIcon sx={iconStyle} />}
        />
      )}
      {!!paymentInfo?.description && (
        <FieldContainer
          title="paymentSummaryPage.causal"
          body={paymentInfo.description}
          icon={<ReceiptLongIcon sx={iconStyle} />}
        />
      )}
      <FieldContainer
        title="paymentSummaryPage.amount"
        body={paymentInfo && moneyFormat(paymentInfo.amount)}
        icon={<EuroIcon sx={iconStyle} />}
        endAdornment={
          <InfoOutlinedIcon
            color="primary"
            sx={{ mr: 2, cursor: "pointer" }}
            onClick={handleInfoClick}
            onKeyDown={handleKeyDown}
            aria-label={t("ariaLabels.informationDialog")}
            role="dialog"
            tabIndex={0}
          />
        }
      />
      {!!noticeInfo?.billCode && (
        <FieldContainer
          title="paymentSummaryPage.billCode"
          body={noticeInfo.billCode}
          flexDirection="row"
          overflowWrapBody={false}
          sx={{ px: 2 }}
        />
      )}
      {!!paymentInfo?.paFiscalCode && (
        <FieldContainer
          title="paymentSummaryPage.cf"
          body={paymentInfo.paFiscalCode}
          flexDirection="row"
          overflowWrapBody={false}
          sx={{ px: 2 }}
        />
      )}

      <FormButtons
        submitTitle="paymentSummaryPage.buttons.submit"
        cancelTitle="paymentSummaryPage.buttons.cancel"
        idSubmit="paymentSummaryButtonPay"
        disabledSubmit={false}
        handleSubmit={onSubmit}
        handleCancel={() => navigate(-1)}
      />
      <InformationModal
        open={modalOpen}
        onClose={handleClose}
        maxWidth="sm"
        hideIcon={true}
      >
        <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
          {t("paymentSummaryPage.dialog.title")}
        </Typography>
        <Typography
          variant="body1"
          component={"div"}
          sx={{ whiteSpace: "pre-line" }}
        >
          {t("paymentSummaryPage.dialog.description")}
        </Typography>
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleClose}>
            {t("paymentSummaryPage.buttons.ok")}
          </Button>
        </Box>
      </InformationModal>
    </PageContainer>
  );
}
