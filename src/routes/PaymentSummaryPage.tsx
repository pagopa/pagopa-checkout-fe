import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EuroIcon from "@mui/icons-material/Euro";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
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
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../utils/mixpanel/mixpanelEvents";
import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
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

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_SUMMARY_INFO_SCREEN, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_SUMMARY_INFO_SCREEN,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      data_entry: getDataEntryTypeFromSessionStorage(),
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });
  }, []);

  const onSubmit = React.useCallback(async () => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_START_FLOW, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_START_FLOW,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.ACTION,
      data_entry: getDataEntryTypeFromSessionStorage(),
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });

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
          <IconButton
            id="infoButton"
            sx={{
              mr: 2,
              color: "primary.main",
              backgroundColor:
                "custom.paymentSummary.infoButton.background.default",
            }}
            onClick={handleInfoClick}
            onKeyDown={handleKeyDown}
            aria-label={t("ariaLabels.informationDialog")}
          >
            <InfoOutlinedIcon />
          </IconButton>
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
        idCancel="paymentSummaryButtonBack"
        disabledSubmit={false}
        handleSubmit={onSubmit}
        handleCancel={() => navigate(-1)}
      />
      <InformationModal
        title={t("paymentSummaryPage.dialog.title")}
        open={modalOpen}
        onClose={handleClose}
        maxWidth="sm"
        hideIcon={true}
      >
        <Box sx={{ mt: -1 }}>
          <Typography
            variant="body1"
            component={"div"}
            sx={{
              "& ul": {
                listStyleType: "none",
                paddingLeft: 0,
                marginTop: 2,
                marginBottom: 0,
              },
              "& li": {
                display: "flex",
                marginBottom: 1,
              },
              "& li.second": {
                marginTop: 0,
              },
              "& li .bullet": {
                minWidth: "24px",
              },
              "& p:first-of-type": {
                marginTop: 0,
              },
            }}
          >
            {t("paymentSummaryPage.dialog.description")
              .split("\n\n")
              .map((paragraph, idx) => {
                if (paragraph.includes("• ")) {
                  const [intro, ...bulletPoints] = paragraph.split("\n• ");

                  return (
                    <React.Fragment key={idx}>
                      <p>{intro}</p>
                      <ul>
                        {bulletPoints.map((point, pointIdx) => (
                          <li key={pointIdx}>
                            <span className="bullet">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  );
                } else {
                  return <p key={idx}>{paragraph}</p>;
                }
              })}
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleClose}>
              {t("paymentSummaryPage.buttons.ok")}
            </Button>
          </Box>
        </Box>
      </InformationModal>
    </PageContainer>
  );
}
