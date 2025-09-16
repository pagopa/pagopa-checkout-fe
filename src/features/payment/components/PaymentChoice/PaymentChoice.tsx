/* eslint-disable sonarjs/cognitive-complexity */
import Box from "@mui/material/Box/Box";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { Typography, Button, InputAdornment, IconButton } from "@mui/material";
import { t } from "i18next";
import { Clear, Search } from "@mui/icons-material";
import TextFormField from "../../../../components/TextFormField/TextFormField";
import InformationModal from "../../../../components/modals/InformationModal";
import ErrorModal from "../../../../components/modals/ErrorModal";
import CheckoutLoader from "../../../../components/PageContent/CheckoutLoader";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { useAppDispatch } from "../../../../redux/hooks/hooks";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { getFees, recaptchaTransaction } from "../../../../utils/api/helper";
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
import { onErrorActivate } from "../../../../utils/api/transactionsErrorHelper";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";
import { getNormalizedMethods } from "./utils";

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstrumentsType>;
  loading?: boolean;
}) {
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (ref.current) {
      setLoading(false);
    }
  }, [ref.current]);

  const resetPaymentMethodFilter = () => {
    setPaymentMethodFilter("");
  };

  const onError = (m: string) => {
    setLoading(false);
    setError(m);
    setErrorModalOpen(true);
    ref.current?.reset();
  };

  const onPspNotFound = () => {
    setLoading(false);
    setPspNotFoundModalOpen(true);
    ref.current?.reset();
  };

  const onSuccess = (
    paymentTypeCode: PaymentCodeType,
    belowThreshold?: boolean
  ) => {
    const route: string = PaymentMethodRoutes[paymentTypeCode]?.route;

    if (belowThreshold !== undefined) {
      dispatch(setThreshold({ belowThreshold }));
    }

    setLoading(false);

    const navigateToRoute = route || CheckoutRoutes.RIEPILOGO_PAGAMENTO;

    if (
      navigateToRoute === CheckoutRoutes.RIEPILOGO_PAGAMENTO &&
      localStorage.getItem(SessionItems.enablePspPage) === "true"
    ) {
      navigate(`/${CheckoutRoutes.LISTA_PSP}`);
    } else {
      navigate(`/${navigateToRoute}`);
    }
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
        await getFees(onSuccess, onPspNotFound, onError);
      },
      onError: (faultCodeCategory, faultCodeDetail) =>
        onErrorActivate(faultCodeCategory, faultCodeDetail, onError, navigate),
    });
  };

  const filterPaymentMethodsHandler = async (value: string) => {
    if (!loading) {
      setPaymentMethodFilter(value);
    }
  };

  const filterPaymentMethods = (p: any) =>
    p.description.toLowerCase().indexOf(paymentMethodFilter.toLowerCase()) > -1;

  const handleClickOnMethod = async (method: PaymentInstrumentsType) => {
    if (!loading) {
      const { paymentTypeCode, id: paymentMethodId } = method;
      setSessionItem(SessionItems.paymentMethodInfo, {
        title: method.description,
        asset: method.asset || "",
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

  const paymentMethodsNotVisible = () =>
    paymentMethods.enabled
      .concat(paymentMethods.disabled)
      .filter(filterPaymentMethods).length === 0 &&
    paymentMethods.enabled.concat(paymentMethods.disabled).length > 0;

  return (
    <>
      {loading && <CheckoutLoader />}
      {props.loading ? (
        Array.from({ length: 5 }, (_, index) => (
          <ClickableFieldContainer key={index} loading />
        ))
      ) : (
        <>
          <TextFormField
            label={t("paymentChoicePage.filterLabel")}
            id="paymentMethodsFilter"
            fullWidth
            handleChange={(e) =>
              filterPaymentMethodsHandler(e.currentTarget.value)
            }
            value={paymentMethodFilter}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={resetPaymentMethodFilter}
                  edge="end"
                  id="clearFilterPaymentMethod"
                  data-testid="clearFilterPaymentMethod"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            }
            error={false}
            errorText={undefined}
            type="text"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            handleBlur={() => {}}
          />
          <MethodComponentList
            methods={
              paymentMethodFilter === ""
                ? paymentMethods.enabled
                : paymentMethods.enabled.filter(filterPaymentMethods)
            }
            onClick={handleClickOnMethod}
            testable
          />
          <DisabledPaymentMethods
            methods={
              paymentMethodFilter === ""
                ? paymentMethods.disabled
                : paymentMethods.disabled.filter(filterPaymentMethods)
            }
          />
        </>
      )}
      {paymentMethodsNotVisible() && (
        <Typography>
          {t("paymentChoicePage.noPaymentMethodsAvailable")}
        </Typography>
      )}

      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
      {!!errorModalOpen && (
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            navigate(`/${CheckoutRoutes.ERRORE}`, { replace: true });
          }}
          titleId="iframeCardFormErrorTitleId"
          errorId="iframeCardFormErrorId"
          bodyId="iframeCardFormErrorBodyId"
        />
      )}
      {!!pspNotFoundModal && (
        <InformationModal
          open={pspNotFoundModal}
          onClose={() => {
            setPspNotFoundModalOpen(false);
          }}
          maxWidth="sm"
          hideIcon={true}
        >
          <Typography
            variant="h6"
            component={"div"}
            sx={{ pb: 2 }}
            id="pspNotFoundTitleId"
          >
            {t("pspUnavailable.title")}
          </Typography>
          <Typography
            variant="body1"
            component={"div"}
            sx={{ whiteSpace: "pre-line" }}
            id="pspNotFoundBodyId"
          >
            {t("pspUnavailable.body")}
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => {
                setPspNotFoundModalOpen(false);
              }}
              id="pspNotFoundCtaId"
            >
              {t("pspUnavailable.cta.primary")}
            </Button>
          </Box>
        </InformationModal>
      )}
    </>
  );
}
