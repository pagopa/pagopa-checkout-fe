import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { t } from "i18next";
import { Trans } from "react-i18next";
import PageContainer from "../components/PageContent/PageContainer";
import IframeCardForm from "../features/payment/components/IframeCardForm/IframeCardForm";
import { getSessionItem, SessionItems } from "../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import {
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelPaymentPhase,
} from "../utils/mixpanel/mixpanelEvents";
import InformationModal from "../components/modals/InformationModal";

export default function IFrameCardPage() {
  const navigate = useNavigate();
  const [loading] = React.useState(false);
  const [hideCancelButton, setHideCancelButton] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const handleClose = () => setModalOpen(false);

  React.useEffect(() => {
    setHideCancelButton(
      !!pipe(
        getSessionItem(SessionItems.transaction),
        NewTransactionResponse.decode,
        E.fold(
          () => undefined,
          (transaction) => transaction.transactionId
        )
      )
    );
  }, []);

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_METHOD_DATA_INSERT, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_METHOD_DATA_INSERT,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      flow: getFlowFromSessionStorage(),
      payment_phase: MixpanelPaymentPhase.ATTIVA,
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });
  }, []);

  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Button
        data-testid="helpLink"
        id={"helpLink"}
        variant="text"
        onClick={() => setModalOpen(true)}
        sx={{ p: 0 }}
      >
        {t("iframeCardPage.helpLink")}
      </Button>
      <Box sx={{ mt: 6 }}>
        <IframeCardForm
          onCancel={onCancel}
          hideCancel={hideCancelButton}
          loading={loading}
        />
      </Box>
      <InformationModal
        open={modalOpen}
        onClose={handleClose}
        maxWidth="sm"
        hideIcon={true}
      >
        <Typography
          data-testid="modalTitle"
          variant="h6"
          component={"div"}
          sx={{ pb: 2 }}
        >
          {t("iframeCardPage.modalTitle")}
        </Typography>
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
            <Trans i18nKey="iframeCardPage.modalBodyText">
              Default text <br /> Fallback
            </Trans>
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              data-testid="closeButton"
              variant="contained"
              onClick={handleClose}
            >
              {t("iframeCardPage.buttonClose")}
            </Button>
          </Box>
        </Box>
      </InformationModal>
    </PageContainer>
  );
}
