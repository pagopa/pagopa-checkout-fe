import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import PageContainer from "../components/PageContent/PageContainer";
import IframeCardForm from "../features/payment/components/IframeCardForm/IframeCardForm";
import { getSessionItem, SessionItems } from "../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import {
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage
} from "../utils/mixpanel/mixpanelTracker";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelPaymentPhase
} from "../utils/mixpanel/mixpanelEvents";

export default function IFrameCardPage() {
  const navigate = useNavigate();
  const [loading] = React.useState(false);
  const [hideCancelButton, setHideCancelButton] = React.useState(false);

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
      payment_phase: MixpanelPaymentPhase.VERIFICA,
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });
  }, []);

  const onCancel = () => navigate(-1);
  return (
    <PageContainer title="inputCardPage.title">
      <Box sx={{ mt: 6 }}>
        <IframeCardForm
          onCancel={onCancel}
          hideCancel={hideCancelButton}
          loading={loading}
        />
      </Box>
    </PageContainer>
  );
}
