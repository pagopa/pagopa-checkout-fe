import Box from "@mui/material/Box/Box";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import CheckoutLoader from "../../../../components/PageContent/CheckoutLoader";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { getFees, recaptchaTransaction } from "../../../../utils/api/helper";
import { PAYMENT_METHODS_CHOICE } from "../../../../utils/config/mixpanelDefs";
import { mixpanel } from "../../../../utils/config/mixpanelHelperInit";
import {
  SessionItems,
  getReCaptchaKey,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import {
  PaymentCodeType,
  PaymentCodeTypeEnum,
  PaymentInstrumentsType,
} from "../../models/paymentModel";
import { setThreshold } from "../../../../redux/slices/threshold";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";
import { getNormalizedMethods } from "./utils";

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstrumentsType>;
  loading?: boolean;
}) {
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(true);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (ref.current) {
      setLoading(false);
    }
  }, [ref.current]);

  const onError = () => {
    setLoading(false);
    ref.current?.reset();
  };

  const onSuccess = (
    paymentTypeCode: PaymentCodeType,
    belowThreshold?: boolean
  ) => {
    const route: string = PaymentMethodRoutes[paymentTypeCode]?.route;
    mixpanel.track(PAYMENT_METHODS_CHOICE.value, {
      EVENT_ID: paymentTypeCode,
    });

    if (belowThreshold !== undefined) {
      dispatch(setThreshold({ belowThreshold }));
    }

    setLoading(false);
    navigate(`/${route || CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
  };

  const onApmChoice = async (
    recaptchaRef: ReCAPTCHA,
    onSuccess: (belowThreshold: boolean) => void
  ) => {
    // TODO uuid module dependency and
    // the orderId and correlationId setSession below
    // must be removed once the transaction API
    // is refactored to make orderId and
    // x-correlation-id optional
    setSessionItem(SessionItems.orderId, "orderId");
    setSessionItem(SessionItems.correlationId, uuidV4());
    setLoading(true);
    await recaptchaTransaction({
      recaptchaRef,
      onSuccess: async () => {
        await getFees(onSuccess, onError);
      },
      onError,
    });
  };

  const handleClickOnMethod = async (method: PaymentInstrumentsType) => {
    if (!loading) {
      const { paymentTypeCode, id: paymentMethodId } = method;
      setSessionItem(SessionItems.paymentMethodInfo, {
        title: method.description,
      });

      setSessionItem(SessionItems.paymentMethod, {
        paymentMethodId,
        paymentTypeCode,
      });
      if (paymentTypeCode !== PaymentCodeTypeEnum.CP && ref.current) {
        await onApmChoice(ref.current, (belowThreshold: boolean) =>
          onSuccess(paymentTypeCode, belowThreshold)
        );
      } else {
        onSuccess(paymentTypeCode);
      }
    }
  };

  const paymentMethods = React.useMemo(
    () => getNormalizedMethods(props.paymentInstruments),
    [props.amount, props.paymentInstruments]
  );

  return (
    <>
      {loading && <CheckoutLoader />}
      {props.loading ? (
        Array.from({ length: 5 }, (_, index) => (
          <ClickableFieldContainer key={index} loading />
        ))
      ) : (
        <>
          <MethodComponentList
            methods={paymentMethods.enabled}
            onClick={handleClickOnMethod}
            testable
          />
          <DisabledPaymentMethods methods={paymentMethods.disabled} />
        </>
      )}
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
    </>
  );
}
