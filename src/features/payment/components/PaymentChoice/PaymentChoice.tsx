/* eslint-disable sonarjs/cognitive-complexity */
import Box from "@mui/material/Box/Box";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import {
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import { t } from "i18next";
import {
  CancelSharp,
  FilterList,
  InfoOutlined,
  Search,
} from "@mui/icons-material";
import { constVoid } from "fp-ts/function";
import { PaymentMethodFilter } from "utils/PaymentMethodFilterUtil";
import { ButtonNaked } from "@pagopa/mui-italia";
import { getMethodDescriptionForCurrentLanguage } from "../../../../utils/paymentMethods/paymentMethodsHelper";
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
import { PaymentInstrumentsType } from "../../models/paymentModel";
import { setThreshold } from "../../../../redux/slices/threshold";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import { onErrorActivate } from "../../../../utils/api/transactionsErrorHelper";
import { PaymentTypeCodeEnum } from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";
import { getNormalizedMethods, paymentTypeTranslationKeys } from "./utils";
import { PaymentChoiceFilterDrawer } from "./PaymentChoiceFilterDrawer";

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstrumentsType>;
  loading?: boolean;
}) {
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState("");

  const [paymentMethodFilterState, setPaymentMethodFilterState] =
    React.useState<PaymentMethodFilter>({
      paymentType: undefined,
      installment: false,
    });

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
    paymentTypeCode: PaymentTypeCodeEnum,
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

  const filterPaymentMethods = (p: PaymentInstrumentsType) =>
    getMethodDescriptionForCurrentLanguage(p)
      .toLowerCase()
      .indexOf(paymentMethodFilter.toLowerCase()) > -1;

  const filterPaymentMethodsCombined = (p: PaymentInstrumentsType) => {
    const hasInstallment = p.metadata?.INSTALLMENTS === "true";

    const matchesText = filterPaymentMethods(p);
    const matchesType =
      !paymentMethodFilterState.paymentType ||
      p.paymentMethodTypes?.includes(paymentMethodFilterState.paymentType);
    const matchesInstallment =
      !paymentMethodFilterState.installment ||
      hasInstallment === paymentMethodFilterState.installment;
    return matchesText && matchesType && matchesInstallment;
  };

  const getFilteredPaymentMethods = (
    paymentMethods: Array<PaymentInstrumentsType>
  ) => paymentMethods.filter(filterPaymentMethodsCombined);

  const handleClickOnMethod = async (method: PaymentInstrumentsType) => {
    if (!loading) {
      const { paymentTypeCode, id: paymentMethodId } = method;
      setSessionItem(SessionItems.paymentMethodInfo, {
        title: getMethodDescriptionForCurrentLanguage(method),
        asset: method.asset || "",
      });

      setSessionItem(SessionItems.paymentMethod, {
        paymentMethodId,
        paymentTypeCode,
      });
      if (paymentTypeCode !== PaymentTypeCodeEnum.CP && ref.current) {
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

  const filterKeyPresent = () =>
    paymentMethodFilter !== undefined && paymentMethodFilter !== "";

  const applyPaymentFilter = (filter: PaymentMethodFilter | null) => {
    if (filter) {
      setPaymentMethodFilterState(filter);
    } else {
      setPaymentMethodFilterState({
        paymentType: undefined,
        installment: false,
      });
    }
  };

  const noPaymentMethodsVisible = () =>
    paymentMethods.enabled
      .concat(paymentMethods.disabled)
      .filter(filterPaymentMethodsCombined).length === 0 &&
    paymentMethods.enabled.concat(paymentMethods.disabled).length > 0;

  const handleDelete = () => {
    setPaymentMethodFilterState((prevState) => ({
      ...prevState,
      paymentType: undefined,
    }));
  };

  const handleDeleteInstallment = () => {
    setPaymentMethodFilterState((prevState) => ({
      ...prevState,
      installment: false,
    }));
  };

  return (
    <>
      {loading && <CheckoutLoader />}
      {props.loading ? (
        Array.from({ length: 5 }, (_, index) => (
          <ClickableFieldContainer key={index} loading />
        ))
      ) : (
        <>
          <Stack direction="row" spacing={2}>
            <TextFormField
              label="paymentChoicePage.filterLabel"
              variant="outlined"
              type="text"
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
                filterKeyPresent() && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={resetPaymentMethodFilter}
                      edge="end"
                      id="clearFilterPaymentMethod"
                      data-testid="clearFilterPaymentMethod"
                      sx={{
                        color: "action.active",
                      }}
                    >
                      <CancelSharp />
                    </IconButton>
                  </InputAdornment>
                )
              }
              error={false}
              errorText={undefined}
              handleBlur={constVoid}
            />
            <ButtonNaked
              id="filterDrawerButton"
              component="button"
              style={{ fontWeight: 600, fontSize: "1rem" }}
              color="primary"
              onClick={() => {
                setDrawerOpen(true);
              }}
            >
              {t("paymentChoicePage.filterButton")}
              <FilterList />
            </ButtonNaked>
          </Stack>

          {paymentMethodFilterState && paymentMethodFilterState.paymentType && (
            <Chip
              id="paymentTypeChipFilter"
              sx={{
                mr: 1,
                mt: 2,
                "&.MuiChip-root": {
                  backgroundColor: "#E1F5FE",
                  color: "#215C76",
                },
                "& .MuiChip-deleteIcon": {
                  color: "#215C76",
                },
              }}
              label={
                paymentMethodFilterState.paymentType
                  ? t(
                      paymentTypeTranslationKeys[
                        paymentMethodFilterState.paymentType
                      ]
                    )
                  : ""
              }
              onDelete={handleDelete}
              deleteIcon={<CancelSharp id="removePaymentTypeFilter" />}
            />
          )}

          {paymentMethodFilterState && paymentMethodFilterState.installment && (
            <Chip
              id="buyNowPayLaterChipFilter"
              sx={{
                mt: 2,
                "&.MuiChip-root": {
                  backgroundColor: "#E1F5FE",
                  color: "#215C76",
                },
                "& .MuiChip-deleteIcon": {
                  color: "#215C76",
                },
              }}
              label={t("paymentChoicePage.drawer.payByPlan")}
              onDelete={handleDeleteInstallment}
              deleteIcon={<CancelSharp id="removeBuyNowPayLaterFilter" />}
            />
          )}

          <MethodComponentList
            methods={getFilteredPaymentMethods(paymentMethods.enabled)}
            onClick={handleClickOnMethod}
            testable
          />
          <DisabledPaymentMethods
            methods={getFilteredPaymentMethods(paymentMethods.disabled)}
          />
          <PaymentChoiceFilterDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            paymentMethodFilterModel={paymentMethodFilterState}
            onSelect={applyPaymentFilter}
          />
        </>
      )}
      {noPaymentMethodsVisible() && (
        <Stack direction="row" spacing={1} marginTop={3}>
          <InfoOutlined fontSize={"small"} />
          <Typography id="noPaymentMethodsMessage" fontSize={"16px"}>
            {t("paymentChoicePage.noPaymentMethodsAvailable")}
          </Typography>
        </Stack>
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
