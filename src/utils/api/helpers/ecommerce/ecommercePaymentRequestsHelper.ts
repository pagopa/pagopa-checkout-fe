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
      () =>
        pipe(
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
        ),
      () => "Errore recupero pagamento"
    ),
    TE.fold(
      (_) => TE.left({ faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR }),
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () =>
              TE.left({ faultCodeCategory: FaultCategoryEnum.GENERIC_ERROR }),
            (responseType) => {
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
  await pipe(
    TE.tryCatch(
      () => apiPaymentEcommerceClient.GetCarts({ id_cart }),
      () => {
        onError(ErrorsType.STATUS_ERROR);
        return E.toError;
      }
    ),
    TE.fold(
      () => async () => {
        onError(ErrorsType.STATUS_ERROR);
        return {};
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              onError(ErrorsType.STATUS_ERROR);
              return {};
            },
            (myRes) => {
              if (myRes.status === 200) {
                onResponse(myRes.value as any as Cart);
                return myRes.value;
              } else {
                onError(ErrorsType.STATUS_ERROR);
                return {};
              }
            }
          )
        )
    )
  )();
};
