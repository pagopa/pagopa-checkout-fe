import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import {
  NpgFlowState,
  NpgFlowStateEvtData,
} from "../features/payment/models/npgModel";
import { CheckoutRoutes } from "./models/routeModel";

const GdiCheckPage = () => {
  const navigate = useNavigate();

  const replace = (route: string) => navigate(route, { replace: true });

  const gdiCheckTimeout =
    Number(process.env.CHECKOUT_GDI_CHECK_TIMEOUT) || 12000;

  const gdiIframeUrl = getFragmentParameter(
    window.location.href,
    "gdiIframeUrl"
  );

  const buildConf = {
    onBuildFlowStateChange(
      npgFlowStateEvtData: NpgFlowStateEvtData,
      npgFlowState: NpgFlowState
    ) {
      switch (npgFlowState) {
        case NpgFlowState.PAYMENT_COMPLETE:
          replace(`/${CheckoutRoutes.ESITO}`);
          break;
        case NpgFlowState.REDIRECTED_TO_EXTERNAL_DOMAIN:
          window.location.replace(npgFlowStateEvtData.data.url);
          break;
        default:
          replace(`/${CheckoutRoutes.ERRORE}`);
      }
    },
  };

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new Build(buildConf);
      const timeoutId = setTimeout(
        () => replace(`/${CheckoutRoutes.ESITO}`),
        gdiCheckTimeout
      );
      return () => clearTimeout(timeoutId);
    } catch {
      return replace(`/${CheckoutRoutes.ERRORE}`);
    }
  }, []);

  return (
    <PageContainer>
      <CheckoutLoader />
      <iframe src={gdiIframeUrl} style={{ display: "none" }} />
    </PageContainer>
  );
};
export default GdiCheckPage;
