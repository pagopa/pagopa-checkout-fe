/* eslint-disable functional/no-let */

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Cart } from "features/payment/models/paymentModel";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV3,
} from "../../../../utils/api/client";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { mixpanel } from "../../../../utils/config/mixpanelHelperInit";
import {
  CART_REQUEST_ACCESS,
  CART_REQUEST_NET_ERROR,
  CART_REQUEST_RESP_ERROR,
  CART_REQUEST_SUCCESS,
  CART_REQUEST_SVR_ERROR,
  PAYMENT_VERIFY_INIT,
  PAYMENT_VERIFY_NET_ERR,
  PAYMENT_VERIFY_RESP_ERR,
  PAYMENT_VERIFY_SUCCESS,
  PAYMENT_VERIFY_SVR_ERR,
} from "../../../../utils/config/mixpanelDefs";
import { PaymentRequestsGetResponse } from "../../../../../generated/definitions/payment-ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../generated/definitions/payment-ecommerce/RptId";
import { FaultCategoryEnum } from "../../../../../generated/definitions/payment-ecommerce/FaultCategory";
import { NodeFaultCode } from "./nodeFaultCode";

export const getEcommercePaymentInfoTask = (
  rptId: RptId,
  recaptchaResponse: string
): TE.TaskEither<NodeFaultCode, PaymentRequestsGetResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_VERIFY_INIT.value, {
          EVENT_ID: PAYMENT_VERIFY_INIT.value,
        });

        return pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () =>
              apiPaymentEcommerceClient.getPaymentRequestInfo({
                rpt_id: rptId,
                recaptchaResponse,
              }),
            (bearerAuth) => {
              // init API invocation page to handle return url in case of 401
              setSessionItem(
                SessionItems.loginOriginPage,
                `${location.pathname}${location.search}`
              );
              return apiPaymentEcommerceClientV3.getPaymentRequestInfoV3({
                rpt_id: rptId,
                bearerAuth, // add auth token
              });
            }
          )
        );
      },
      () => {
        mixpanel.track(PAYMENT_VERIFY_NET_ERR.value, {
          EVENT_ID: PAYMENT_VERIFY_NET_ERR.value,
        });
        return "Errore recupero pagamento";
      }
    ),
    TE.fold(
      (_) => {
        mixpanel.track(PAYMENT_VERIFY_SVR_ERR.value, {
          EVENT_ID: PAYMENT_VERIFY_SVR_ERR.value,
        });
        return TE.left({ faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR });
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () =>
              TE.left({ faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR }),
            (responseType) => {
              let reason;
              if (responseType.status === 200) {
                reason = "";
              } else if (responseType.status === 400) {
                reason = responseType.value.title;
              } else {
                reason = responseType.value?.faultCodeDetail;
              }

              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_VERIFY_SUCCESS.value
                  : PAYMENT_VERIFY_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID, reason });

              if (responseType.status === 401) {
                return TE.left({
                  faultCodeCategory: "SESSION_EXPIRED",
                  faultCodeDetail: "Unauthorized",
                });
              }
              if (responseType.status === 400) {
                return TE.left({
                  faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR as string,
                });
              }
              return responseType.status !== 200
                ? TE.left({
                    faultCodeCategory:
                      responseType.value?.faultCodeCategory ??
                      FaultCategoryEnum.GENERIC_ERROR,
                    faultCodeDetail:
                      responseType.value?.faultCodeDetail ?? "Unknown error",
                  })
                : TE.of(responseType.value);
            }
          )
        )
    )
  );

export const getCarts = async (
  id_cart: string,
  onError: (e: string) => void,
  onResponse: (data: Cart) => void
) => {
  mixpanel.track(CART_REQUEST_ACCESS.value, {
    EVENT_ID: CART_REQUEST_ACCESS.value,
  });
  await pipe(
    TE.tryCatch(
      () => apiPaymentEcommerceClient.GetCarts({ id_cart }),
      () => {
        mixpanel.track(CART_REQUEST_NET_ERROR.value, {
          EVENT_ID: CART_REQUEST_NET_ERROR.value,
        });
        onError(ErrorsType.STATUS_ERROR);
        return E.toError;
      }
    ),
    TE.fold(
      () => async () => {
        mixpanel.track(CART_REQUEST_SVR_ERROR.value, {
          EVENT_ID: CART_REQUEST_SVR_ERROR.value,
        });
        onError(ErrorsType.STATUS_ERROR);
        return {};
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              mixpanel.track(CART_REQUEST_RESP_ERROR.value, {
                EVENT_ID: CART_REQUEST_RESP_ERROR.value,
              });
              onError(ErrorsType.STATUS_ERROR);
              return {};
            },
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(CART_REQUEST_SUCCESS.value, {
                  EVENT_ID: CART_REQUEST_SUCCESS.value,
                });
                onResponse(myRes.value as any as Cart);
                return myRes.value;
              } else {
                mixpanel.track(CART_REQUEST_RESP_ERROR.value, {
                  EVENT_ID: CART_REQUEST_RESP_ERROR.value,
                });
                onError(ErrorsType.STATUS_ERROR);
                return {};
              }
            }
          )
        )
    )
  )();
};
