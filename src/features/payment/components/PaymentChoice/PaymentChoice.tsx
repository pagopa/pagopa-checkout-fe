import Box from "@mui/material/Box/Box";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { CalculateFeeResponse } from "../../../../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import CheckoutLoader from "../../../../components/PageContent/CheckoutLoader";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { setThreshold } from "../../../../redux/slices/threshold";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { activatePayment, calculateFees } from "../../../../utils/api/helper";
import { PAYMENT_METHODS_CHOICE } from "../../../../utils/config/mixpanelDefs";
import { mixpanel } from "../../../../utils/config/mixpanelHelperInit";
import {
  SessionItems,
  getReCaptchaKey,
  getSessionItem,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import {
  PaymentCodeType,
  PaymentCodeTypeEnum,
  PaymentInstrumentsType,
  PaymentMethod,
} from "../../models/paymentModel";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";
import { getNormalizedMethods } from "./utils";

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

  const getFees = (onSuccess: () => void) =>
    calculateFees({
      paymentId:
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
      onError,
      onResponsePsp: (resp) => {
        pipe(
          resp,
          CalculateFeeResponse.decode,
          O.fromEither,
          O.chain((resp) => O.fromNullable(resp.belowThreshold)),
          O.fold(
            () => onError(),
            (value) => {
              dispatch(setThreshold({ belowThreshold: value }));
              const firstPsp = pipe(
                resp?.bundles,
                O.fromNullable,
                O.chain((sortedArray) => O.fromNullable(sortedArray[0])),
                O.map((a) => a as Bundle),
                O.getOrElseW(() => ({}))
              );

              setSessionItem(SessionItems.pspSelected, firstPsp);
              onSuccess();
            }
          )
        );
      },
    });

  const transaction = async (
    recaptchaRef: ReCAPTCHA,
    onSuccess: () => void
  ) => {
    setLoading(true);
    const token = await callRecaptcha(recaptchaRef, true);
    await activatePayment({
      token,
      onResponseActivate: async () => {
        await getFees(onSuccess);
      },
      onErrorActivate: onError,
    });
  };

  const onSuccess = (paymentTypeCode: PaymentCodeType) => {
    const route: string = PaymentMethodRoutes[paymentTypeCode]?.route;
    setLoading(false);
    navigate(`/${route}`);
  };

  const handleClickOnMethod = async (method: PaymentInstrumentsType) => {
    if (!loading) {
      const { paymentTypeCode, id: paymentMethodId } = method;
      mixpanel.track(PAYMENT_METHODS_CHOICE.value, {
        EVENT_ID: paymentTypeCode,
      });

      setSessionItem(SessionItems.paymentMethodInfo, {
        title: method.name,
        body: method.description,
      });

      setSessionItem(SessionItems.paymentMethod, {
        paymentMethodId,
        paymentTypeCode,
      });
      if (paymentTypeCode !== PaymentCodeTypeEnum.CP && ref.current) {
        await transaction(ref.current, () => onSuccess(paymentTypeCode));
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
