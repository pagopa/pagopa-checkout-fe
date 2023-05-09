/* eslint-disable functional/no-let */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { toError } from "fp-ts/lib/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import {
  LanguageEnum,
  RequestAuthorizationRequest,
} from "../../../generated/definitions/payment-ecommerce/RequestAuthorizationRequest";
import { RptId } from "../../../generated/definitions/payment-ecommerce/RptId";
import { ValidationFaultPaymentProblemJson } from "../../../generated/definitions/payment-ecommerce/ValidationFaultPaymentProblemJson";
import {
  Cart,
  PaymentFormFields,
  PaymentInfo,
  PaymentInstruments,
  PaymentMethod,
} from "../../features/payment/models/paymentModel";
import {
  PaymentMethodRoutes,
  TransactionMethods,
} from "../../routes/models/paymentMethodRoutes";
import { getConfigOrThrow } from "../config/config";
import {
  CART_REQUEST_ACCESS,
  CART_REQUEST_NET_ERROR,
  CART_REQUEST_RESP_ERROR,
  CART_REQUEST_SUCCESS,
  CART_REQUEST_SVR_ERROR,
  DONATION_INIT_SESSION,
  DONATION_LIST_ERROR,
  DONATION_LIST_SUCCESS,
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
  PAYMENT_METHODS_ACCESS,
  PAYMENT_METHODS_NET_ERROR,
  PAYMENT_METHODS_RESP_ERROR,
  PAYMENT_METHODS_SUCCESS,
  PAYMENT_METHODS_SVR_ERROR,
  PAYMENT_PSPLIST_INIT,
  PAYMENT_PSPLIST_NET_ERR,
  PAYMENT_PSPLIST_RESP_ERR,
  PAYMENT_PSPLIST_SUCCESS,
  PAYMENT_PSPLIST_SVR_ERR,
  PAYMENT_VERIFY_INIT,
  PAYMENT_VERIFY_NET_ERR,
  PAYMENT_VERIFY_RESP_ERR,
  PAYMENT_VERIFY_SUCCESS,
  PAYMENT_VERIFY_SVR_ERR,
  TRANSACTION_AUTH_INIT,
  TRANSACTION_AUTH_NET_ERROR,
  TRANSACTION_AUTH_RESP_ERROR,
  TRANSACTION_AUTH_SUCCES,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { ErrorsType } from "../errors/checkErrorsModel";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../storage/sessionStorage";
import { AmountEuroCents } from "../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { BrandEnum } from "../../../generated/definitions/payment-ecommerce/PaymentInstrumentDetail";
import { PaymentRequestsGetResponse } from "../../../generated/definitions/payment-ecommerce/PaymentRequestsGetResponse";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransferListItem } from "../../../generated/definitions/payment-ecommerce/TransferListItem";
import { Bundle } from "../../../generated/definitions/payment-ecommerce/Bundle";
import { PaymentNoticeInfo } from "../../../generated/definitions/payment-ecommerce/PaymentNoticeInfo";
import { getBrowserInfoTask, getEMVCompliantColorDepth } from "./checkHelper";
import {
  apiPaymentEcommerceCalculateFeesClientWithRetry,
  apiPaymentEcommerceClient,
  apiPaymentTransactionsClient,
} from "./client";

export const getEcommercePaymentInfoTask = (
  rptId: RptId,
  recaptchaResponse: string
): TE.TaskEither<string, PaymentRequestsGetResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_VERIFY_INIT.value, {
          EVENT_ID: PAYMENT_VERIFY_INIT.value,
        });
        return apiPaymentEcommerceClient.getPaymentRequestInfo({
          rpt_id: rptId,
          recaptchaResponse,
        });
      },
      () => {
        mixpanel.track(PAYMENT_VERIFY_NET_ERR.value, {
          EVENT_ID: PAYMENT_VERIFY_NET_ERR.value,
        });
        return "Errore recupero pagamento";
      }
    ),
    TE.fold(
      (err) => {
        mixpanel.track(PAYMENT_VERIFY_SVR_ERR.value, {
          EVENT_ID: PAYMENT_VERIFY_SVR_ERR.value,
        });
        return TE.left(err);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(ErrorsType.GENERIC_ERROR),
            (responseType) => {
              let reason;
              if (responseType.status === 200) {
                reason = "";
              }
              if (responseType.status === 400) {
                reason = (
                  responseType.value as ValidationFaultPaymentProblemJson
                )?.faultCodeCategory;
              } else {
                reason = (
                  responseType.value as ValidationFaultPaymentProblemJson
                )?.faultCodeDetail;
              }
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_VERIFY_SUCCESS.value
                  : PAYMENT_VERIFY_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID, reason });

              if (responseType.status === 400) {
                return TE.left(
                  pipe(
                    O.fromNullable(
                      (responseType.value as ValidationFaultPaymentProblemJson)
                        ?.faultCodeCategory
                    ),
                    O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                  )
                );
              }
              return responseType.status !== 200
                ? TE.left(
                    pipe(
                      O.fromNullable(
                        (
                          responseType.value as ValidationFaultPaymentProblemJson
                        )?.faultCodeDetail
                      ),
                      O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                    )
                  )
                : TE.of(responseType.value);
            }
          )
        )
    )
  );

export const activatePayment = async ({
  bin,
  onResponseActivate,
  onErrorActivate,
}: {
  bin: string;
  onResponseActivate: (bin: string) => void;
  onErrorActivate: (e: string) => void;
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
  pipe(
    PaymentRequestsGetResponse.decode(paymentInfo),
    E.fold(
      () => onErrorActivate(ErrorsType.INVALID_DECODE),
      (response) =>
        pipe(
          activePaymentTask(response.amount, userEmail || "", rptId, cartInfo),
          TE.fold(
            (e: string) => async () => {
              onErrorActivate(e);
            },
            (res) => async () => {
              setSessionItem(SessionItems.transaction, res);
              onResponseActivate(bin);
            }
          )
        )()
    )
  );
};

const activePaymentTask = (
  amountSinglePayment: AmountEuroCents,
  userEmail: string,
  rptId: RptId,
  cart?: Cart
): TE.TaskEither<string, NewTransactionResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_INIT.value, {
          EVENT_ID: PAYMENT_ACTIVATE_INIT.value,
        });
        return apiPaymentEcommerceClient.newTransaction({
          // recaptchaResponse,
          body: {
            paymentNotices: getPaymentNotices(amountSinglePayment, rptId, cart),
            idCart: cart?.idCart,
            email: userEmail,
          },
        });
      },
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_NET_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATE_NET_ERR.value,
        });
        return "Errore attivazione pagamento";
      }
    ),
    TE.fold(
      (err) => {
        mixpanel.track(PAYMENT_ACTIVATE_SVR_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATE_SVR_ERR.value,
        });
        return TE.left(err);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left("Errore attivazione pagamento"),
            (responseType) => {
              let reason;
              if (responseType.status === 200) {
                reason = "";
              }
              if (responseType.status === 400) {
                reason = (
                  responseType.value as ValidationFaultPaymentProblemJson
                )?.faultCodeCategory;
              } else {
                reason = (
                  responseType.value as ValidationFaultPaymentProblemJson
                )?.faultCodeDetail;
              }
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_ACTIVATE_SUCCESS.value
                  : PAYMENT_ACTIVATE_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID, reason });

              if (responseType.status === 400) {
                return TE.left(
                  pipe(
                    O.fromNullable(
                      (responseType.value as ValidationFaultPaymentProblemJson)
                        ?.faultCodeCategory
                    ),
                    O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                  )
                );
              }
              return responseType.status !== 200
                ? TE.left(
                    pipe(
                      O.fromNullable(
                        (
                          responseType.value as ValidationFaultPaymentProblemJson
                        )?.faultCodeDetail
                      ),
                      O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                    )
                  )
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

// -> Promise<Either<string, BundleOptions>>
export const calculateFees = async ({
  paymentId,
  bin,
  onError,
  onResponsePsp,
}: {
  paymentId: string;
  bin: string;
  onError: (e: string) => void;
  onResponsePsp: (r: any) => void;
}) => {
  const amount: number | undefined = pipe(
    O.fromNullable(getSessionItem(SessionItems.cart) as Cart | undefined),
    O.map((cart) =>
      cart.paymentNotices.reduce(
        (totalAmount, notice) => totalAmount + notice.amount,
        0
      )
    ),
    O.alt(() =>
      pipe(
        O.fromNullable(
          getSessionItem(SessionItems.paymentInfo) as PaymentInfo | undefined
        ),
        O.map((paymentInfo) => paymentInfo.amount)
      )
    ),
    O.getOrElseW(() => undefined)
  );

  const transferList: Array<TransferListItem> = pipe(
    getSessionItem(SessionItems.transaction) as NewTransactionResponse,
    O.fromNullable,
    O.map((transaction) => transaction.payments[0].transferList), // TODO By now we can handle only single rptId notice, since GEC is not compliant with multiple rptIds notice (cart)
    O.map((transferList) =>
      transferList.map((transfer) => ({
        creditorInstitution: transfer.paFiscalCode,
        digitalStamp: transfer.digitalStamp,
        transferCategory: transfer.transferCategory,
      }))
    ),
    O.getOrElse(() => [] as Array<TransferListItem>)
  );

  const primaryCreditorInstitution =
    transferList.at(0)?.creditorInstitution || ""; // TODO replace with primaryCreditorInstitution from transaction response when available (activate V2)

  mixpanel.track(PAYMENT_PSPLIST_INIT.value, {
    EVENT_ID: PAYMENT_PSPLIST_INIT.value,
  });
  const MAX_OCCURENCES_AFM = 2147483647;
  const bundleOption = await pipe(
    TE.tryCatch(
      () =>
        apiPaymentEcommerceCalculateFeesClientWithRetry.calculateFees({
          id: paymentId,
          maxOccurrences: MAX_OCCURENCES_AFM,
          body: {
            bin,
            touchpoint: "CHECKOUT",
            paymentAmount: amount ? amount : 0,
            primaryCreditorInstitution,
            transferList,
          },
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_PSPLIST_NET_ERR.value, {
          EVENT_ID: PAYMENT_PSPLIST_NET_ERR.value,
        });
        return toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_PSPLIST_SVR_ERR.value, {
          EVENT_ID: PAYMENT_PSPLIST_SVR_ERR.value,
        });
        return {};
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => [],
            (myRes) => {
              if (myRes?.status === 200) {
                mixpanel.track(PAYMENT_PSPLIST_SUCCESS.value, {
                  EVENT_ID: PAYMENT_PSPLIST_SUCCESS.value,
                });
                return myRes?.value;
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                mixpanel.track(PAYMENT_PSPLIST_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_PSPLIST_RESP_ERR.value,
                });
                return {};
              }
            }
          )
        )
    )
  )();

  onResponsePsp(bundleOption);
};

export const proceedToPayment = async (
  {
    transaction,
    cardData,
  }: {
    transaction: NewTransactionResponse;
    cardData: {
      brand: string;
      cvv: string;
      pan: string;
      expiryDate: string;
      holderName: string;
    };
  },
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

  const browserInfo = await pipe(
    getBrowserInfoTask(apiPaymentTransactionsClient),
    TE.mapLeft(() => ({
      ip: "",
      useragent: "",
      accept: "",
    })),
    TE.toUnion
  )();
  const threeDSData = {
    browserJavaEnabled: navigator.javaEnabled().toString(),
    browserLanguage: navigator.language,
    browserColorDepth: getEMVCompliantColorDepth(screen.colorDepth).toString(),
    browserScreenHeight: screen.height.toString(),
    browserScreenWidth: screen.width.toString(),
    browserTZ: new Date().getTimezoneOffset().toString(),
    browserAcceptHeader: browserInfo.accept,
    browserIP: browserInfo.ip,
    browserUserAgent: navigator.userAgent,
    acctID: `ACCT_${transactionId}`,
    deliveryEmailAddress:
      (getSessionItem(SessionItems.useremail) as string) || "",
    mobilePhone: null,
  };

  const authParams = {
    amount: transaction.payments
      .map((p) => p.amount)
      .reduce((sum, current) => Number(sum) + Number(current), 0),
    fee:
      (getSessionItem(SessionItems.pspSelected) as Bundle | undefined)
        ?.taxPayerFee || 0,
    paymentInstrumentId:
      (getSessionItem(SessionItems.paymentMethod) as PaymentMethod | undefined)
        ?.paymentMethodId || "",
    pspId:
      (getSessionItem(SessionItems.pspSelected) as Bundle | undefined)?.idPsp ||
      "",
    details:
      (getSessionItem(SessionItems.paymentMethod) as PaymentMethod | undefined)
        ?.paymentTypeCode === "CP"
        ? {
            detailType: "card",
            brand: getBrandByBrandCardValidator(cardData.brand),
            cvv: cardData.cvv,
            pan: cardData.pan,
            expiryDate: cardData.expiryDate,
            holderName: cardData.holderName,
            threeDsData: JSON.stringify(threeDSData),
          }
        : {
            detailType: "postepay",
            accountEmail:
              (getSessionItem(SessionItems.useremail) as string) || "",
          },
    language: LanguageEnum.IT,
  };

  await pipe(
    authParams,
    RequestAuthorizationRequest.decode,
    TE.fromEither,
    TE.chain(
      (request) => () =>
        apiPaymentEcommerceClient.requestTransactionAuthorization({
          bearerAuth,
          transactionId,
          body: request,
        })
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(TRANSACTION_AUTH_NET_ERROR.value, {
          EVENT_ID: TRANSACTION_AUTH_NET_ERROR.value,
        });
      }, // to be replaced with logic to handle failures
      (response) => {
        if (response.status === 200) {
          mixpanel.track(TRANSACTION_AUTH_SUCCES.value, {
            EVENT_ID: TRANSACTION_AUTH_SUCCES.value,
          });
          const authorizationUrl = response.value.authorizationUrl;
          onResponse(authorizationUrl);
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          return T.fromIO(() => {});
        } else {
          onError(ErrorsType.GENERIC_ERROR);
          mixpanel.track(TRANSACTION_AUTH_RESP_ERROR.value, {
            EVENT_ID: TRANSACTION_AUTH_RESP_ERROR.value,
          });
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          return T.fromIO(() => {});
        }
      }
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
        return toError;
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
              return toError;
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

export const getDonationEntityList = async (
  onError: (e: string) => void,
  onResponse: (data: any) => void
) => {
  mixpanel.track(DONATION_INIT_SESSION.value, {
    EVENT_ID: DONATION_INIT_SESSION.value,
  });

  window
    .fetch(getConfigOrThrow().CHECKOUT_DONATIONS_URL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(ErrorsType.DONATIONLIST_ERROR);
    })
    .then((data) => {
      mixpanel.track(DONATION_LIST_SUCCESS.value, {
        EVENT_ID: DONATION_LIST_SUCCESS.value,
      });
      onResponse(data);
    })
    .catch(() => {
      mixpanel.track(DONATION_LIST_ERROR.value, {
        EVENT_ID: DONATION_LIST_ERROR.value,
      });
      onError(ErrorsType.DONATIONLIST_ERROR);
    });
};

export const getPaymentInstruments = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void,
  onResponse: (data: Array<PaymentInstruments>) => void
) => {
  mixpanel.track(PAYMENT_METHODS_ACCESS.value, {
    EVENT_ID: PAYMENT_METHODS_ACCESS.value,
  });
  const list = await pipe(
    TE.tryCatch(
      () => apiPaymentEcommerceClient.getAllPaymentMethods(query),
      () => {
        mixpanel.track(PAYMENT_METHODS_NET_ERROR.value, {
          EVENT_ID: PAYMENT_METHODS_NET_ERROR.value,
        });
        onError(ErrorsType.STATUS_ERROR);
        return toError;
      }
    ),
    TE.fold(
      () => async () => {
        mixpanel.track(PAYMENT_METHODS_SVR_ERROR.value, {
          EVENT_ID: PAYMENT_METHODS_SVR_ERROR.value,
        });
        onError(ErrorsType.STATUS_ERROR);
        return [];
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              mixpanel.track(PAYMENT_METHODS_RESP_ERROR.value, {
                EVENT_ID: PAYMENT_METHODS_RESP_ERROR.value,
              });
              return [];
            },
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(PAYMENT_METHODS_SUCCESS.value, {
                  EVENT_ID: PAYMENT_METHODS_SUCCESS.value,
                });
                return myRes.value.paymentMethods
                  ?.filter(
                    (method) =>
                      !!PaymentMethodRoutes[
                        method.paymentTypeCode as TransactionMethods
                      ]
                  )
                  .map((method) => ({
                    ...method,
                    label:
                      PaymentMethodRoutes[
                        method.paymentTypeCode as TransactionMethods
                      ]?.label || method.name,
                    asset:
                      PaymentMethodRoutes[
                        method.paymentTypeCode as TransactionMethods
                      ]?.asset, // when asset will be added to the object, add || method.asset
                  }));
              } else {
                mixpanel.track(PAYMENT_METHODS_RESP_ERROR.value, {
                  EVENT_ID: PAYMENT_METHODS_RESP_ERROR.value,
                });
                return [];
              }
            }
          )
        )
    )
  )();
  onResponse(list as any as Array<PaymentInstruments>);
};

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
        return toError;
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

export const parseDate = (dateInput: string | null): O.Option<string> =>
  pipe(
    dateInput,
    O.fromNullable,
    O.map((dateValue) => "01/".concat(dateValue)),
    O.chain((value) =>
      O.fromNullable(value.match(/(\d{2})\/(\d{2})\/(\d{2})/))
    ),
    O.map((matches) => matches.slice(1)),
    O.map((matches) => [matches[0], matches[1], matches[2]]),
    O.map(
      ([day, month, year]) =>
        new Date(Number(year) + 2000, Number(month) - 1, Number(day))
    ),
    O.map((date) => expDateToString(date))
  );

const expDateToString = (dateParsed: Date) =>
  ""
    .concat(
      dateParsed.getFullYear().toLocaleString("it-IT", {
        minimumIntegerDigits: 4,
        useGrouping: false,
      })
    )
    .concat(
      (dateParsed.getMonth() + 1).toLocaleString("it-IT", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    );

/*
  export const getTransactionData = async ({
    // va fatta la GET transaction
    idPayment,
    onError,
    onResponse,
    onNavigate,
  }: {
    idPayment: string;
    onError: (e: string) => void;
    onResponse: () => void;
    onNavigate: () => void;
  }) => {
    mixpanel.track(PAYMENT_CHECK_INIT.value, {
      EVENT_ID: PAYMENT_CHECK_INIT.value,
    });
    void pipe(
      O.fromNullable(idPayment),
      O.fold(
        () => undefined,
        async () =>
          await pipe(
            TE.tryCatch(
              () =>
                apiPaymentEcommerceClient.getTransactionInfo({
                  bearerAuth: pipe(
                    getSessionItem(SessionItems.transaction),
                    O.fromNullable,
                    O.map((transaction) => transaction as Transaction),
                    O.chain((t) => O.fromNullable(t.authToken)),
                    O.getOrElse(() => "")
                  ),
                  transactionId: pipe(
                    O.fromNullable(idPayment),
                    O.getOrElse(() => "")
                  ),
                }),
              // Error on call
              () => {
                onError(ErrorsType.CONNECTION);
                mixpanel.track(PAYMENT_CHECK_NET_ERR.value, {
                  EVENT_ID: PAYMENT_CHECK_NET_ERR.value,
                });
                return toError;
              }
            ),
            TE.fold(
              () => async () => {
                onError(ErrorsType.SERVER);
                mixpanel.track(PAYMENT_CHECK_SVR_ERR.value, {
                  EVENT_ID: PAYMENT_CHECK_SVR_ERR.value,
                });
              },
              (myResExt) => async () => {
                pipe(
                  myResExt,
                  E.fold(
                    () => onError(ErrorsType.GENERIC_ERROR),
                    (response) => {
                      const maybePayment = TransactionInfo.decode(response.value);
                      // eslint-disable-next-line no-underscore-dangle
                      if (response.status === 200) {
                        pipe(
                          maybePayment,
  
                          E.map((payment) => {
                            setSessionItem(SessionItems.transaction, payment);
                            onResponse();
                            mixpanel.track(PAYMENT_CHECK_SUCCESS.value, {
                              EVENT_ID: PAYMENT_CHECK_SUCCESS.value,
                            });
                          })
                        );
                      } else {
                        onNavigate();
                        mixpanel.track(PAYMENT_CHECK_RESP_ERR.value, {
                          EVENT_ID: PAYMENT_CHECK_RESP_ERR.value,
                        });
                      }
                    }
                  )
                );
              }
            )
          )()
      )
    );
  }; */

const getBrandByBrandCardValidator = (
  brandCardValidator: string
): BrandEnum => {
  switch (brandCardValidator) {
    case "visa":
      return BrandEnum.VISA;
    case "american-express":
      return BrandEnum.AMEX;
    case "maestro":
      return BrandEnum.MAESTRO;
    case "mastercard":
      return BrandEnum.MASTERCARD;
    case "diners-club":
      return BrandEnum.DINERS;
    default:
      return BrandEnum.UNKNOWN;
  }
};
