/* eslint-disable functional/no-let */
/* eslint-disable sonarjs/cognitive-complexity */
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import ReCAPTCHA from "react-google-recaptcha";
import { mixpanel } from "../../../../utils/config/mixpanelHelperInit";
import {
  Cart,
  PaymentFormFields,
  PaymentMethod,
} from "../../../../features/payment/models/paymentModel";
import {
  getRptIdsFromSession,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import {
  PAYMENT_ACTION_DELETE_INIT,
  PAYMENT_ACTION_DELETE_NET_ERR,
  PAYMENT_ACTION_DELETE_RESP_ERR,
  PAYMENT_ACTION_DELETE_SUCCESS,
  PAYMENT_ACTION_DELETE_SVR_ERR,
  PAYMENT_ACTIVATE_INIT,
  PAYMENT_ACTIVATE_NET_ERR,
  PAYMENT_ACTIVATE_RESP_ERR,
  PAYMENT_ACTIVATE_SUCCESS,
  PAYMENT_ACTIVATE_SVR_ERR,
  TRANSACTION_AUTH_INIT,
  TRANSACTION_AUTH_RESP_ERROR,
  TRANSACTION_AUTH_SUCCES,
} from "../../../../utils/config/mixpanelDefs";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV2,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientWithRetry,
} from "../../../../utils/api/client";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { callRecaptcha } from "../recaptchaHelper";
import { PaymentRequestsGetResponse } from "../../../../../generated/definitions/payment-ecommerce/PaymentRequestsGetResponse";
import { PaymentInfo } from "../../../../../generated/definitions/payment-ecommerce/PaymentInfo";
import { PaymentNoticeInfo } from "../../../../../generated/definitions/payment-ecommerce/PaymentNoticeInfo";
import { RptId } from "../../../../../generated/definitions/payment-ecommerce/RptId";
import { AmountEuroCents } from "../../../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { FaultCategoryEnum } from "../../../../../generated/definitions/payment-ecommerce/FaultCategory";
import {
  LanguageEnum,
  RequestAuthorizationRequest,
} from "../../../../../generated/definitions/payment-ecommerce/RequestAuthorizationRequest";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { NodeFaultCode } from "./nodeFaultCode";

export const activatePayment = async ({
  token,
  onResponseActivate,
  onErrorActivate,
}: {
  token: string;
  onResponseActivate: (paymentMethodId: string, orderId: string) => void;
  onErrorActivate: (
    faultCodeCategory: string,
    faultCodeDetail: string | undefined
  ) => void;
}) => {
  const noticeInfo = getSessionItem(SessionItems.noticeInfo) as
    | PaymentFormFields
    | undefined;
  const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  const userEmail = getSessionItem(SessionItems.useremail) as
    | string
    | undefined;
  const cartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const rptId: RptId = `${noticeInfo?.cf}${noticeInfo?.billCode}` as RptId;
  const paymentMethod: PaymentMethod = getSessionItem(
    SessionItems.paymentMethod
  ) as PaymentMethod;
  const orderId: string = getSessionItem(SessionItems.orderId) as string;
  const correlationId: string = getSessionItem(
    SessionItems.correlationId
  ) as string;
  // fallback to CHECKOUT client id in case of missing session item
  const cartClientId: string =
    (getSessionItem(SessionItems.cartClientId) as string | undefined) ||
    "CHECKOUT";
  pipe(
    PaymentRequestsGetResponse.decode(paymentInfo),
    E.fold(
      () => onErrorActivate(ErrorsType.INVALID_DECODE, undefined),
      (response) =>
        pipe(
          activePaymentTask(
            response.amount,
            userEmail || "",
            rptId,
            token,
            orderId,
            correlationId,
            cartClientId,
            cartInfo
          ),
          TE.fold(
            (e: NodeFaultCode) => async () => {
              onErrorActivate(e.faultCodeCategory, e.faultCodeDetail);
            },
            (res) => async () => {
              setSessionItem(SessionItems.transaction, res);
              onResponseActivate(paymentMethod.paymentMethodId, orderId);
            }
          )
        )()
    )
  );
};

export const recaptchaTransaction = async ({
  recaptchaRef,
  onSuccess,
  onError,
}: {
  recaptchaRef: ReCAPTCHA;
  onSuccess: (paymentMethodId: string, orderId: string) => void;
  onError: (
    faultCodeCategory: string,
    faultCodeDetail: string | undefined
  ) => void;
}) => {
  const token = await callRecaptcha(recaptchaRef, true);
  await activatePayment({
    token,
    onResponseActivate: onSuccess,
    onErrorActivate: onError,
  });
};

const activePaymentTask = (
  amountSinglePayment: AmountEuroCents,
  userEmail: string,
  rptId: RptId,
  recaptchaResponse: string,
  orderId: string,
  correlationId: string,
  cartClientId: string,
  cart?: Cart
): TE.TaskEither<NodeFaultCode, NewTransactionResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_INIT.value, {
          EVENT_ID: PAYMENT_ACTIVATE_INIT.value,
        });

        // base payload shared between both auth and non-auth APIs
        const payload = {
          "x-correlation-id": correlationId,
          "x-client-id-from-client": cartClientId,
          body: {
            paymentNotices: getPaymentNotices(amountSinglePayment, rptId, cart),
            idCart: cart?.idCart,
            email: userEmail,
            orderId,
          },
        };

        return pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () =>
              apiPaymentEcommerceClientV2.newTransaction({
                ...payload,
                recaptchaResponse,
              }),
            (bearerAuth) => {
              // init API invocation page to handle return url in case of 401
              setSessionItem(
                SessionItems.loginOriginPage,
                `${location.pathname}${location.search}`
              );
              return apiPaymentEcommerceClientV3.newTransactionV3({
                "x-rpt-id": getRptIdsFromSession(),
                bearerAuth, // add auth token
                ...payload,
              });
            }
          )
        );
      },
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_NET_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATE_NET_ERR.value,
        });
        return "Errore attivazione pagamento";
      }
    ),
    TE.fold(
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_SVR_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATE_SVR_ERR.value,
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
                const cartInfo = getSessionItem(SessionItems.cart) as
                  | Cart
                  | undefined;
                const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
                  | PaymentInfo
                  | undefined;
                if (cartInfo !== undefined) {
                  const rptIdAmountMap = new Map(
                    responseType.value.payments.map(
                      (p) => [p.rptId, p.amount] as [RptId, AmountEuroCents]
                    )
                  );
                  const creditorReferenceMap = new Map(
                    responseType.value.payments.map(
                      (p) =>
                        [p.rptId, p.creditorReferenceId] as [
                          RptId,
                          string | undefined
                        ]
                    )
                  );

                  const updatedPaymentNotices = cartInfo.paymentNotices.map(
                    (paymentNotice) => {
                      const rptId =
                        `${paymentNotice.fiscalCode}${paymentNotice.noticeNumber}` as RptId;
                      const updatedAmount = rptIdAmountMap.get(rptId);
                      const creditorId = creditorReferenceMap.get(rptId);

                      return {
                        ...paymentNotice,
                        creditorReferenceId: creditorId,
                        amount: updatedAmount ?? paymentNotice.amount,
                      };
                    }
                  );
                  setSessionItem(SessionItems.cart, {
                    ...cart,
                    paymentNotices: updatedPaymentNotices,
                  });
                } else if (paymentInfo !== undefined) {
                  setSessionItem(SessionItems.paymentInfo, {
                    ...paymentInfo,
                    creditorReferenceId:
                      responseType.value.payments[0].creditorReferenceId,
                  });
                }
              }
              if (responseType.status === 200) {
                reason = "";
              } else if (responseType.status === 400) {
                reason = responseType.value?.title;
              } else {
                reason = responseType.value?.faultCodeDetail;
              }
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_ACTIVATE_SUCCESS.value
                  : PAYMENT_ACTIVATE_RESP_ERR.value;
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

const getPaymentNotices = (
  amountSinglePayment: AmountEuroCents,
  rptId: RptId,
  cart?: Cart
): Array<PaymentNoticeInfo> =>
  pipe(
    O.fromNullable(cart?.paymentNotices),
    O.map((paymentNotices) =>
      paymentNotices.map(
        (paymentNotice) =>
          ({
            rptId: paymentNotice.fiscalCode
              .toString()
              .concat(paymentNotice.noticeNumber),
            amount: paymentNotice.amount,
          } as PaymentNoticeInfo)
      )
    ),
    O.getOrElse(() => [
      {
        rptId,
        amount: amountSinglePayment,
      },
    ])
  );

export const proceedToPayment = async (
  transaction: NewTransactionResponse,
  onError: (e: string) => void,
  onResponse: (authUrl: string) => void
) => {
  mixpanel.track(TRANSACTION_AUTH_INIT.value, {
    EVENT_ID: TRANSACTION_AUTH_INIT.value,
  });

  const transactionId = pipe(
    transaction,
    O.fromNullable,
    O.map((transaction) => transaction.transactionId),
    O.getOrElse(() => "")
  );

  const bearerAuth = pipe(
    transaction,
    O.fromNullable,
    O.chain((transaction) => O.fromNullable(transaction.authToken)),
    O.getOrElse(() => "")
  );

  const isAllCCP = pipe(
    transaction,
    O.fromNullable,
    O.map((transaction) => transaction.payments[0].isAllCCP),
    O.getOrElseW(() => undefined)
  );

  const details = pipe(
    getSessionItem(SessionItems.paymentMethod) as PaymentMethod | undefined,
    O.fromNullable,
    O.map((method) => method.paymentTypeCode),
    O.fold(
      () => {
        // eslint-disable-next-line no-console
        console.error(
          "Missing expected `paymentMethod.paymentTypeCode` in session storage!"
        );

        onError(ErrorsType.GENERIC_ERROR);
        return O.none;
      },
      (x) => O.some(x)
    ),
    O.chain((paymentTypeCode) => {
      switch (paymentTypeCode) {
        case "CP":
          return O.some({
            detailType: "cards",
            orderId:
              (getSessionItem(SessionItems.orderId) as string | undefined) ||
              "",
          });
        case "MYBK":
        case "BPAY":
        case "PPAL":
        case "APPL":
        case "SATY":
          return O.some({
            detailType: "apm",
          });
        case "RBPR":
        case "RBPB":
        case "RBPP":
        case "RPIC":
        case "RBPS":
        case "RICO":
          return O.some({
            detailType: "redirect",
          });
        default:
          // eslint-disable-next-line no-console
          console.error("Unhandled payment type code: " + paymentTypeCode);
          onError(ErrorsType.GENERIC_ERROR);
          return O.none;
      }
    })
  );

  const authParam = pipe(
    details,
    O.map((d) => ({
      amount: transaction.payments
        .map((p) => p.amount)
        .reduce((sum, current) => Number(sum) + Number(current), 0),
      fee:
        (getSessionItem(SessionItems.pspSelected) as Bundle | undefined)
          ?.taxPayerFee || 0,
      paymentInstrumentId:
        (
          getSessionItem(SessionItems.paymentMethod) as
            | PaymentMethod
            | undefined
        )?.paymentMethodId || "",
      pspId:
        (getSessionItem(SessionItems.pspSelected) as Bundle | undefined)
          ?.idPsp || "",
      isAllCCP,
      details: d,
      language: LanguageEnum.IT,
    }))
  );

  const requestAuth = flow(
    RequestAuthorizationRequest.decode,
    TE.fromEither,
    TE.chain(
      (request: RequestAuthorizationRequest) => () =>
        apiPaymentEcommerceClientWithRetry.requestTransactionAuthorization({
          bearerAuth,
          transactionId,
          lang: localStorage.getItem("i18nextLng") ?? "it",
          body: request,
        })
    ),
    TE.map((response) => {
      if (response.status === 200) {
        mixpanel.track(TRANSACTION_AUTH_SUCCES.value, {
          EVENT_ID: TRANSACTION_AUTH_SUCCES.value,
        });
        const { authorizationUrl } = response.value;
        onResponse(authorizationUrl);
      } else {
        mixpanel.track(TRANSACTION_AUTH_RESP_ERROR.value, {
          EVENT_ID: TRANSACTION_AUTH_RESP_ERROR.value,
        });
        onError(ErrorsType.CONNECTION);
      }
    })
  );

  await pipe(
    authParam,
    O.map((p) =>
      pipe(
        TE.tryCatch(requestAuth(p), (_e) => TE.left(_e)),
        TE.mapLeft((_e) => {
          onError(ErrorsType.GENERIC_ERROR);
          return ErrorsType.GENERIC_ERROR;
        })
      )
    ),
    O.fold(
      () => {
        onError(ErrorsType.GENERIC_ERROR);
        return TE.left(ErrorsType.GENERIC_ERROR);
      },
      (task) => task
    )
  )();
};

export const cancelPayment = async (
  onError: (e: string, userCancelRedirect: boolean) => void,
  onResponse: () => void
) => {
  mixpanel.track(PAYMENT_ACTION_DELETE_INIT.value, {
    EVENT_ID: PAYMENT_ACTION_DELETE_INIT.value,
  });

  const transactionId = pipe(
    getSessionItem(SessionItems.transaction) as NewTransactionResponse,
    O.fromNullable,
    O.map((transaction) => transaction.transactionId),
    O.getOrElse(() => "")
  );

  const bearerAuth = pipe(
    getSessionItem(SessionItems.transaction) as NewTransactionResponse,
    O.fromNullable,
    O.chain((transaction) => O.fromNullable(transaction.authToken)),
    O.getOrElse(() => "")
  );

  await pipe(
    TE.fromPredicate(
      (idTransaction) => idTransaction !== "",
      E.toError
    )(transactionId),
    TE.fold(
      () => async () => {
        onError(ErrorsType.GENERIC_ERROR, true);
        return E.toError;
      },
      () => async () =>
        await pipe(
          TE.tryCatch(
            () =>
              apiPaymentEcommerceClient.requestTransactionUserCancellation({
                bearerAuth,
                transactionId,
              }),
            () => {
              onError(ErrorsType.CONNECTION, false);
              mixpanel.track(PAYMENT_ACTION_DELETE_NET_ERR.value, {
                EVENT_ID: PAYMENT_ACTION_DELETE_NET_ERR.value,
              });
              return E.toError;
            }
          ),
          TE.fold(
            () => async () => {
              onError(ErrorsType.SERVER, false);
              mixpanel.track(PAYMENT_ACTION_DELETE_SVR_ERR.value, {
                EVENT_ID: PAYMENT_ACTION_DELETE_SVR_ERR.value,
              });
              return {};
            },
            (myResExt) => async () =>
              pipe(
                myResExt,
                E.fold(
                  () => PAYMENT_ACTION_DELETE_RESP_ERR.value,
                  (myRes) => {
                    if (myRes?.status === 202) {
                      onResponse();
                      mixpanel.track(PAYMENT_ACTION_DELETE_SUCCESS.value, {
                        EVENT_ID: PAYMENT_ACTION_DELETE_SUCCESS.value,
                      });
                      return myRes?.value;
                    } else if (myRes.status >= 400 && myRes.status < 500) {
                      onError(ErrorsType.GENERIC_ERROR, true);
                      mixpanel.track(PAYMENT_ACTION_DELETE_RESP_ERR.value, {
                        EVENT_ID: PAYMENT_ACTION_DELETE_RESP_ERR.value,
                      });
                      return {};
                    } else {
                      onError(ErrorsType.GENERIC_ERROR, false);
                      mixpanel.track(PAYMENT_ACTION_DELETE_RESP_ERR.value, {
                        EVENT_ID: PAYMENT_ACTION_DELETE_RESP_ERR.value,
                      });
                      return {};
                    }
                  }
                )
              )
          )
        )()
    )
  )();
};
