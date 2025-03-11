import { NavigateFunction } from "react-router-dom";
import { CheckoutRoutes } from "../../routes/models/routeModel";

const POST_TRANSACTION_ERROR_EXPIRED = ["PPT_WISP_SESSIONE_SCONOSCIUTA"];

export const onErrorActivate = (
  faultCodeCategory: string,
  faultCodeDetail: string | undefined,
  onError: (m: string) => void,
  navigate: NavigateFunction
) => {
  // handle 401 on authorized apis
  if (faultCodeDetail === "Unauthorized") {
    navigate(`/${CheckoutRoutes.AUTH_EXPIRED}`);
  }

  if (
    faultCodeDetail &&
    POST_TRANSACTION_ERROR_EXPIRED.includes(faultCodeDetail)
  ) {
    navigate(`/${CheckoutRoutes.SESSIONE_SCADUTA}`);
  } else {
    onError(`${faultCodeCategory}-${faultCodeDetail}`);
  }
};
