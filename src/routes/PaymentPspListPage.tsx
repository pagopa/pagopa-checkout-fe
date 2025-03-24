import { Box, Typography } from "@mui/material";
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { useTranslation } from "react-i18next";
import { PaymentPSPListGrid } from "../features/payment/components/PaymentPspList/PaymentPspListGrid";
import { calculateFees } from "../utils/api/helper";
import { ErrorsType } from "../utils/errors/checkErrorsModel";
import ErrorModal from "../components/modals/ErrorModal";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import PageContainer from "../components/PageContent/PageContainer";
import { PaymentMethod } from "../features/payment/models/paymentModel";
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
import { CheckoutRoutes } from "./models/routeModel";

const pspSortAlgorithm = (pspList: Array<Bundle>): Array<Bundle> =>
  // current tslib version does not permit spread operator, copy "old style" with Array.from
  Array.from(pspList).sort((a, b) => {
    // onUs always 1st
    if (a.onUs && !b.onUs) {
      return -1;
    }
    // onUs has precedence
    if (!a.onUs && b.onUs) {
      return 1;
    }

    // if there is no onUs, the payer fee has precedence (ASC)
    return (a?.taxPayerFee ?? 0) - (b?.taxPayerFee ?? 0);
  });
export default function PaymentPspListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ref = React.useRef<ReCAPTCHA>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [submitEnabled, setSubmitEnabled] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [pspEditLoading, setPspEditLoading] = React.useState(false);
  const [pspUpdateLoading, setPspUpdateLoading] = React.useState(false);
  const [pspList, setPspList] = React.useState<Array<Bundle>>([]);
  const [pspNotFoundModal, setPspNotFoundModalOpen] = React.useState(false);
  const paymentMethod = getSessionItem(SessionItems.paymentMethod) as
    | PaymentMethod
    | undefined;

  const [pspSelected, setPspSelected] = React.useState<Bundle | undefined>(
    getSessionItem(SessionItems.pspSelected) as Bundle | undefined
  );

  // eslint-disable-next-line no-console
  console.table({
    pspEditLoading,
    pspUpdateLoading,
    submitEnabled,
    pspList: JSON.stringify(pspList),
    pspNotFoundModal,
    pspSelected: JSON.stringify(pspSelected),
  });

  const onPspListSuccessResponse = (calculateFeeResponse: any) => {
    pipe(
      calculateFeeResponse,
      CalculateFeeResponse.decode,
      O.fromEither,
      O.fold(
        () => onError(ErrorsType.GENERIC_ERROR),
        (resp) => {
          const pspList = pspSortAlgorithm(resp?.bundles?.slice() || []);
          if (pspList.length === 0) {
            return onError(ErrorsType.GENERIC_ERROR);
          }

          setPspSelected(pspList[0]);

          if (pspList.length === 1) {
            // TODO: Directly proceed to the next step
          }

          setLoading(false);
          setPspList(pspList);
          setSubmitEnabled(true);
          setPspEditLoading(false);
        }
      )
    );
  };

  const onPspNotFound = () => {
    setPspEditLoading(false);
    setPspUpdateLoading(false);
    // setError(m);
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

  const onError = (m: string, userCancelRedirect?: boolean) => {
    setPspEditLoading(false);
    setPspUpdateLoading(false);
    setError(m);
    setErrorModalOpen(true);
    setSubmitEnabled(false);
    // eslint-disable-next-line no-console
    console.error("onError", m, userCancelRedirect);
  };

  const updateSelectedPSP = (psp: Bundle) => {
    setPspUpdateLoading(true);
    setSessionItem(SessionItems.pspSelected, psp);
    setPspSelected(psp);
    setSubmitEnabled(true);
    setPspUpdateLoading(false);
  };

  const sessionPaymentMethodResponse = getSessionItem(
    SessionItems.sessionPaymentMethod
  ) as SessionPaymentMethodResponse;

  React.useEffect(() => {
    if (!paymentMethod || pspList.length > 0) {
      return;
    }
    void calculateFees({
      paymentId: paymentMethod?.paymentMethodId,
      bin: sessionPaymentMethodResponse?.bin,
      onError,
      onPspNotFound,
      onResponsePsp: onPspListSuccessResponse,
    });
  }, []);

  return (
    <>
      {paymentMethod && loading && <CheckoutLoader />}
      <PageContainer
        title="paymentPspListPage.title"
        description="paymentPspListPage.description"
        childrenSx={{ mt: 6 }}
      >
        <Box sx={{ mt: 6 }}>
          <Typography
            component="div"
            typography="body2"
            display="block"
            mt={2}
            fontWeight="600"
            color="action.active"
          >
            {t("paymentPspListPage.operator")}
          </Typography>
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
