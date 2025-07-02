import { Box } from "@mui/material";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ScheduledMaintenanceBanner } from "../components/commons/ScheduledMaintenanceBanner";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentEmailForm } from "../features/payment/components/PaymentEmailForm/PaymentEmailForm";
import {
  Cart,
  PaymentEmailFormFields,
} from "../features/payment/models/paymentModel";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../utils/mixpanel/mixpanelEvents";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  getDataEntryTypeFromSessionStorage,
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { CheckoutRoutes } from "./models/routeModel";

type LocationProps = {
  state: {
    noConfirmEmail?: boolean;
  };
};

export default function PaymentEmailPage() {
  const { state } = useLocation() as unknown as LocationProps;
  const noConfirmEmail: boolean = (state && state.noConfirmEmail) || false;
  const navigate = useNavigate();
  const email = getSessionItem(SessionItems.useremail) as string | undefined;
  const cartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const cancelUrl = cartInfo?.returnUrls.returnCancelUrl;

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_EMAIL_ADDRESS, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_EMAIL_ADDRESS,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      flow: getFlowFromSessionStorage(),
      data_entry: getDataEntryTypeFromSessionStorage(),
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
    });
  }, []);

  const emailForm = noConfirmEmail
    ? { email: email || "", confirmEmail: "" }
    : { email: email || "", confirmEmail: email || "" };

  const onSubmit = React.useCallback((emailInfo: PaymentEmailFormFields) => {
    setSessionItem(SessionItems.useremail, emailInfo.email);
    navigate(`/${CheckoutRoutes.SCEGLI_METODO}`);
  }, []);

  const onCancel = () =>
    cancelUrl ? window.location.replace(cancelUrl) : navigate(-1);

  const isScheduledMaintenanceBannerEnabled =
    cartInfo &&
    localStorage.getItem(SessionItems.isScheduledMaintenanceBannerEnabled) ===
      "true";

  return (
    <>
      {isScheduledMaintenanceBannerEnabled && <ScheduledMaintenanceBanner />}
      <PageContainer
        title="paymentEmailPage.title"
        description="paymentEmailPage.description"
      >
        <Box sx={{ mt: 6 }}>
          <PaymentEmailForm
            onCancel={onCancel}
            onSubmit={onSubmit}
            defaultValues={emailForm}
          />
          {cartInfo && <PrivacyInfo />}
        </Box>
      </PageContainer>
    </>
  );
}
