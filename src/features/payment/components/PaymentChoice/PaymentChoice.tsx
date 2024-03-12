import React from "react";
import Box from "@mui/material/Box/Box";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { mixpanel } from "../../../../utils/config/mixpanelHelperInit";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { activatePayment } from "../../../../utils/api/helper";
import { PAYMENT_METHODS_CHOICE } from "../../../../utils/config/mixpanelDefs";
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
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";

const shouldBeFirst = (method: PaymentInstrumentsType) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

const sortMethods = (a: PaymentInstrumentsType, b: PaymentInstrumentsType) => {
  if (shouldBeFirst(a)) {
    return -1;
  } else if (shouldBeFirst(b)) {
    return 1;
  }
  return a.description.localeCompare(b.description);
};

const getNormalizedMethods = (
  paymentInstruments: Array<PaymentInstrumentsType>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<PaymentCodeType>;
    methods: Array<PaymentInstrumentsType>;
    duplicatedMethods: Array<PaymentInstrumentsType>;
  }>(
    (acc, method) =>
      acc.foundTypes.includes(method.paymentTypeCode)
        ? { ...acc, duplicatedMethods: acc.duplicatedMethods.concat(method) }
        : {
            ...acc,
            methods: acc.methods.concat(method),
            foundTypes: acc.foundTypes.concat(method.paymentTypeCode),
          },
    {
      foundTypes: [],
      methods: [],
      duplicatedMethods: [],
    }
  );

  const { enabled, disabled } = methods.reduce<{
    enabled: Array<PaymentInstrumentsType>;
    disabled: Array<PaymentInstrumentsType>;
  }>(
    (acc, method) =>
      method.status === PaymentMethodStatusEnum.ENABLED
        ? { ...acc, enabled: acc.enabled.concat(method) }
        : { ...acc, disabled: acc.disabled.concat(method) },
    { disabled: [], enabled: [] }
  );
  return {
    enabled: enabled.slice().sort(sortMethods),
    disabled: disabled.slice().sort(sortMethods),
    duplicatedMethods,
  };
};

const callRecaptcha = async (recaptchaInstance: ReCAPTCHA, reset = false) => {
  if (reset) {
    void recaptchaInstance.reset();
  }
  const recaptchaResponse = await recaptchaInstance.executeAsync();
  return pipe(
    recaptchaResponse,
    O.fromNullable,
    O.getOrElse(() => "")
  );
};

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstrumentsType>;
  loading?: boolean;
}) {
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (ref.current) {
      setLoading(false);
    }
  }, [ref.current]);

  const transaction = async (recaptchaRef: ReCAPTCHA) => {
    const token = await callRecaptcha(recaptchaRef, true);
    await activatePayment({
      token,
      onResponseActivate: () => {
        navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
      },
      onErrorActivate: (e) => console.debug("transaction error", e),
    });
  };

  const handleClickOnMethod = async (
    paymentTypeCode: PaymentCodeType,
    paymentMethodId: string
  ) => {
    mixpanel.track(PAYMENT_METHODS_CHOICE.value, {
      EVENT_ID: paymentTypeCode,
    });

    const route: string = PaymentMethodRoutes[paymentTypeCode]?.route;
    setSessionItem(SessionItems.paymentMethod, {
      paymentMethodId,
      paymentTypeCode,
    });
    if (paymentTypeCode !== PaymentCodeTypeEnum.CP && ref.current) {
      await transaction(ref.current);
    } else {
      window.location.assign(`/${route}`);
    }
  };

  const paymentMethods = React.useMemo(
    () => getNormalizedMethods(props.paymentInstruments),
    [props.amount, props.paymentInstruments]
  );

  return (
    <>
      {props.loading || loading ? (
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
