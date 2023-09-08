import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";
import { getFragmentParameter } from "../utils/regex/urlUtilities";
import { CheckoutRoutes } from "./models/routeModel";

export interface NpgFlowStateEvtData {
  data: {
    url: string;
  };
}

const GdiCheckPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // @ts-ignore
    new Build({
      onBuildFlowStateChange(
        npgFlowStateEvtData: NpgFlowStateEvtData,
        // creare un typo condiviso e riutilizzabile
        state: "REDIRECTED_TO_EXTERNAL_DOMAIN" | "PAYMENT_COMPLETE"
      ) {
        switch (state) {
          case "PAYMENT_COMPLETE":
            navigate(`/${CheckoutRoutes.ESITO}`);
            break;
          case "REDIRECTED_TO_EXTERNAL_DOMAIN":
            // replace? href? indagare quale è migliore
            // eslint-disable-next-line functional/immutable-data
            window.location.replace(npgFlowStateEvtData.data.url);
            break;
          default:
            // gestire l'eventualità di ricevere uno stato non gestito o previsto in questa fase
            // console debug da rimuovere
            console.debug(state);
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
