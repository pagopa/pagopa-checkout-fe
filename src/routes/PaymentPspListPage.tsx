import { Box, Button, Typography } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useTranslation } from "react-i18next";
import { ButtonNaked } from "@pagopa/mui-italia";
import {
  getDataEntryTypeFromSessionStorage,
  getFlowFromSessionStorage,
  getPaymentInfoFromSessionStorage,
  getPaymentMethodSelectedFromSessionStorage,
} from "../utils/mixpanel/mixpanelTracker";
import { PaymentPspListAlert } from "../features/payment/components/PaymentAlert/PaymentPspListAlert";
import { PspOrderingModel, sortBy } from "../utils/SortUtil";
import { PaymentPspListSortingDrawer } from "../features/payment/components/PaymentPspList/PaymentPspListSortingDrawer";
import { PaymentPSPListGrid } from "../features/payment/components/PaymentPspList/PaymentPspListGrid";
import { calculateFees } from "../utils/api/helper";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentMethod } from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { setThreshold } from "../redux/slices/threshold";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { Bundle } from "../../generated/definitions/payment-ecommerce/Bundle";
import { CalculateFeeResponse } from "../../generated/definitions/payment-ecommerce/CalculateFeeResponse";
import { SessionPaymentMethodResponse } from "../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { FormButtons } from "../components/FormButtons/FormButtons";
import InformationModal from "../components/modals/InformationModal";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelPaymentPhase,
} from "../utils/mixpanel/mixpanelEvents";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import { PaymentTypeCodeEnum } from "../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import { CheckoutRoutes } from "./models/routeModel";

export default function PaymentPspListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const ref = React.useRef<ReCAPTCHA>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [submitEnabled, setSubmitEnabled] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [pspList, setPspList] = React.useState<Array<Bundle>>([]);
  const [originalPspList, setOriginalPspList] = React.useState<Array<Bundle>>(
    []
  );
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const paymentMethod = getSessionItem(SessionItems.paymentMethod) as
    | PaymentMethod
    | undefined;

  const [pspSelected, setPspSelected] = React.useState<Bundle | undefined>(
    getSessionItem(SessionItems.pspSelected) as Bundle | undefined
  );

  const [isAlertVisible, setIsAlertVisible] = React.useState(true);

  React.useEffect(() => {
    const paymentInfo = getPaymentInfoFromSessionStorage();
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_FEE_SELECTION, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_FEE_SELECTION,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
      flow: getFlowFromSessionStorage(),
      payment_phase: MixpanelPaymentPhase.ATTIVA,
      organization_name: paymentInfo?.paName,
      organization_fiscal_code: paymentInfo?.paFiscalCode,
      amount: paymentInfo?.amount,
      expiration_date: paymentInfo?.dueDate,
      payment_method_selected: getPaymentMethodSelectedFromSessionStorage(),
      data_entry: getDataEntryTypeFromSessionStorage(),
    });
  }, []);

  const shouldShowMyBankAlert = () =>
    paymentMethod?.paymentTypeCode === PaymentTypeCodeEnum.MYBK &&
    isAlertVisible;

  const myBankAlertVisible = shouldShowMyBankAlert();

  const updatePspSorting = (sortingModel: PspOrderingModel | null) => {
    if (sortingModel === null) {
      setPspList(originalPspList);
    } else {
      setPspList(
        Array.from(originalPspList).sort(sortBy(sortingModel?.fieldName, "asc"))
      );
    }
  };

  const onPspListSuccessResponse = (calculateFeeResponse: any) => {
    pipe(
      calculateFeeResponse,
      CalculateFeeResponse.decode,
      O.fromEither,
      O.chain((resp) =>
        pipe(
          O.fromNullable(resp.belowThreshold),
          O.map((belowThreshold) => {
            dispatch(setThreshold({ belowThreshold }));
            return resp.bundles.slice();
          })
        )
      ),
      O.filter((bundles) => bundles.length > 0),
      O.fold(
        () => onError(ErrorsType.GENERIC_ERROR),
        (bundles) => {
          setLoading(false);
          // Just one? Select the PSP and proceed
          if (bundles.length === 1) {
            setPspSelected(bundles[0]);
            navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
          } else {
            setPspList(bundles);
            setOriginalPspList(bundles);
          }
        }
      )
    );
  };

  const onPspNotFound = () => {
    setPspNotFoundModalOpen(true);
  };

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      // Prevent default form submission behavior if this is within a form
      if (e) {
        e.preventDefault();
      }
      navigate(`/${CheckoutRoutes.RIEPILOGO_PAGAMENTO}`);
    },
    [navigate]
  );

  const onError = (m: string) => {
    setError(m);
    setErrorModalOpen(true);
    setSubmitEnabled(false);
  };

  const updateSelectedPSP = (psp: Bundle) => {
    setSessionItem(SessionItems.pspSelected, psp);
    setPspSelected(psp);
    setSubmitEnabled(true);
  };

  const sessionPaymentMethodResponse = getSessionItem(
    SessionItems.sessionPaymentMethod
  ) as SessionPaymentMethodResponse;

  React.useEffect(() => {
    if (!paymentMethod || pspList.length > 0) {
      return;
    }

    setPspSelected(undefined);

    void calculateFees({
      paymentId: paymentMethod?.paymentMethodId,
      bin: sessionPaymentMethodResponse?.bin,
      walletId: paymentMethod?.walletId,
      walletType: paymentMethod?.walletType,
      pspId: paymentMethod?.pspId,
      onError,
      onPspNotFound,
      onResponsePsp: onPspListSuccessResponse,
    });
  }, []);

  return (
    <>
      {paymentMethod && loading && <CheckoutLoader />}
      {myBankAlertVisible && (
        <PaymentPspListAlert
          titleKey="paymentPspListPage.myBankAlertTitle"
          bodyKey="paymentPspListPage.myBankAlertBody"
          onClose={() => setIsAlertVisible(false)}
        />
      )}
      <PageContainer
        title="paymentPspListPage.title"
        description="paymentPspListPage.description"
        childrenSx={{ mt: 6 }}
      >
        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            component="div"
            typography="body2"
            display="block"
            fontWeight="600"
            color="action.active"
          >
            {t("paymentPspListPage.operator")}
          </Typography>

          <ButtonNaked
            id="sort-psp-list"
            component="button"
            style={{ fontWeight: 600, fontSize: "1rem" }}
            color="primary"
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            {t("paymentPspListPage.sort")}
          </ButtonNaked>
        </Box>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(e);
          }}
        >
          <PaymentPSPListGrid
            pspList={pspList}
            currentSelectedPsp={pspSelected}
            onPspSelected={updateSelectedPSP}
          />

          <FormButtons
            type="submit"
            submitTitle="paymentPspListPage.formButtons.submit"
            cancelTitle="paymentPspListPage.formButtons.back"
            idSubmit="paymentPspListPageButtonContinue"
            disabledSubmit={!submitEnabled}
            handleSubmit={onSubmit}
            handleCancel={() => {
              navigate(-1);
            }}
          />
        </form>

        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
          titleId="pspListTitleError"
          bodyId="pspListBodyError"
          errorId="pspListErrorId"
        />

        {!!pspNotFoundModal && (
          <InformationModal
            open={pspNotFoundModal}
            onClose={() => {
              setPspNotFoundModalOpen(false);
              navigate(`/${CheckoutRoutes.SCEGLI_METODO}`, { replace: true });
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
                  navigate(`/${CheckoutRoutes.SCEGLI_METODO}`, {
                    replace: true,
                  });
                }}
                id="pspNotFoundCtaId"
              >
                {t("pspUnavailable.cta.primary")}
              </Button>
            </Box>
          </InformationModal>
        )}
        <PaymentPspListSortingDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSelect={updatePspSorting}
        />
      </PageContainer>
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
