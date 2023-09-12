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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new Build({
      onBuildFlowStateChange(
        npgFlowStateEvtData: NpgFlowStateEvtData,
        npgFlowState: NpgFlowState
      ) {
        switch (npgFlowState) {
          case NpgFlowState.PAYMENT_COMPLETE:
            navigate(`/${CheckoutRoutes.ESITO}`);
            break;
          case NpgFlowState.REDIRECTED_TO_EXTERNAL_DOMAIN:
            window.location.replace(npgFlowStateEvtData.data.url);
            break;
          default:
          // gestire l'eventualità di ricevere uno stato non gestito o previsto in questa fase
        }
      },
    });
  }, []);

  const gdiIframeUrl = getFragmentParameter(
    window.location.href,
    "gdiIframeUrl"
  );

  return (
    <PageContainer>
      <CheckoutLoader />
      <iframe src={gdiIframeUrl} style={{ display: "none" }} />
    </PageContainer>
  );
};
export default GdiCheckPage;
