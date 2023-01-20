/* eslint-disable functional/no-let */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-identical-functions */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { toError } from "fp-ts/lib/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { CodiceContestoPagamento } from "../../../generated/definitions/payment-activations-api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../../generated/definitions/payment-activations-api/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../../generated/definitions/payment-activations-api/PaymentActivationsGetResponse";
import { PaymentActivationsPostResponse } from "../../../generated/definitions/payment-activations-api/PaymentActivationsPostResponse";
import { Detail_v2Enum } from "../../../generated/definitions/payment-activations-api/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../generated/definitions/payment-activations-api/PaymentRequestsGetResponse";
import { PaymentRequestsGetResponse as EcommercePaymentRequestsGetResponse } from "../../../generated/definitions/payment-ecommerce/PaymentRequestsGetResponse";
import { ValidationFaultPaymentProblemJson } from "../../../generated/definitions/payment-ecommerce/ValidationFaultPaymentProblemJson";
import {
  TypeEnum,
  Wallet,
} from "../../../generated/definitions/payment-manager-api/Wallet";
import { RptId } from "../../../generated/definitions/payment-transactions-api/RptId";
import {
  Cart,
  InputCardFormFields,
  PaymentCheckData,
  PaymentInstruments,
  PspList,
  Wallet as PaymentWallet,
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
  PAYMENT_ACTIVATION_STATUS_INIT,
  PAYMENT_ACTIVATION_STATUS_NET_ERR,
  PAYMENT_ACTIVATION_STATUS_RESP_ERR,
  PAYMENT_ACTIVATION_STATUS_SUCCESS,
  PAYMENT_ACTIVATION_STATUS_SVR_ERR,
  PAYMENT_APPROVE_TERMS_INIT,
  PAYMENT_APPROVE_TERMS_NET_ERR,
  PAYMENT_APPROVE_TERMS_RESP_ERR,
  PAYMENT_APPROVE_TERMS_SUCCESS,
  PAYMENT_APPROVE_TERMS_SVR_ERR,
  PAYMENT_CHECK_INIT,
  PAYMENT_CHECK_NET_ERR,
  PAYMENT_CHECK_RESP_ERR,
  PAYMENT_CHECK_SUCCESS,
  PAYMENT_CHECK_SVR_ERR,
  PAYMENT_METHODS_ACCESS,
  PAYMENT_METHODS_NET_ERROR,
  PAYMENT_METHODS_RESP_ERROR,
  PAYMENT_METHODS_SUCCESS,
  PAYMENT_METHODS_SVR_ERROR,
  PAYMENT_PAY3DS2_INIT,
  PAYMENT_PAY3DS2_NET_ERR,
  PAYMENT_PAY3DS2_RESP_ERR,
  PAYMENT_PAY3DS2_SUCCESS,
  PAYMENT_PAY3DS2_SVR_ERR,
  PAYMENT_PSPLIST_INIT,
  PAYMENT_PSPLIST_NET_ERR,
  PAYMENT_PSPLIST_RESP_ERR,
  PAYMENT_PSPLIST_SUCCESS,
  PAYMENT_PSPLIST_SVR_ERR,
  PAYMENT_START_SESSION_INIT,
  PAYMENT_START_SESSION_NET_ERR,
  PAYMENT_START_SESSION_RESP_ERR,
  PAYMENT_START_SESSION_SUCCESS,
  PAYMENT_START_SESSION_SVR_ERR,
  PAYMENT_UPD_WALLET_INIT,
  PAYMENT_UPD_WALLET_NET_ERR,
  PAYMENT_UPD_WALLET_RESP_ERR,
  PAYMENT_UPD_WALLET_SUCCESS,
  PAYMENT_UPD_WALLET_SVR_ERR,
  PAYMENT_VERIFY_INIT,
  PAYMENT_VERIFY_NET_ERR,
  PAYMENT_VERIFY_RESP_ERR,
  PAYMENT_VERIFY_SUCCESS,
  PAYMENT_VERIFY_SVR_ERR,
  PAYMENT_WALLET_INIT,
  PAYMENT_WALLET_NET_ERR,
  PAYMENT_WALLET_RESP_ERR,
  PAYMENT_WALLET_SUCCESS,
  PAYMENT_WALLET_SVR_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { ErrorsType } from "../errors/checkErrorsModel";
import { PaymentSession } from "../sessionData/PaymentSession";
import { WalletSession } from "../sessionData/WalletSession";
import {
  getCart,
  getCheckData,
  getNoticeInfo,
  getPaymentId,
  getPaymentInfo,
  setPaymentId,
  setReturnUrls,
} from "./apiService";
import { getBrowserInfoTask, getEMVCompliantColorDepth } from "./checkHelper";
import {
  apiPaymentActivationsClient,
  apiPaymentEcommerceClient,
  apiPaymentTransactionsClient,
  pmClient,
} from "./client";

export const getEcommercePaymentInfoTask = (
  rptId: RptId,
  recaptchaResponse: string
): TE.TaskEither<string, EcommercePaymentRequestsGetResponse> =>
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

export const getPaymentInfoTask = (
  rptId: RptId,
  recaptchaResponse: string
): TE.TaskEither<string, PaymentRequestsGetResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_VERIFY_INIT.value, {
          EVENT_ID: PAYMENT_VERIFY_INIT.value,
        });
        return apiPaymentActivationsClient.getPaymentInfo({
          rptId,
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
            () => TE.left(Detail_v2Enum.GENERIC_ERROR),
            (responseType) => {
              const reason =
                responseType.status === 200 ? "" : responseType.value?.detail;
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_VERIFY_SUCCESS.value
                  : PAYMENT_VERIFY_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID, reason });

              if (responseType.status === 400) {
                return TE.left(
                  pipe(
                    O.fromNullable(responseType.value?.detail as Detail_v2Enum),
                    O.getOrElse(() => Detail_v2Enum.GENERIC_ERROR)
                  )
                );
              }
              return responseType.status !== 200
                ? TE.left(
                    pipe(
                      O.fromNullable(responseType.value?.detail),
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
  wallet,
  token,
  onResponse,
  onError,
  onNavigate,
}: {
  wallet: InputCardFormFields;
  token: string;
  onResponse: (cardData: {
    pan: string;
    expDate: string;
    cvv: string;
    cardHolderName: string;
  }) => void;
  onError: (e: string) => void;
  onNavigate: () => void;
}) => {
  const noticeInfo = getNoticeInfo();
  const paymentInfo = getPaymentInfo();
  const paymentInfoTransform = {
    importoSingoloVersamento: paymentInfo.amount,
    codiceContestoPagamento: paymentInfo.paymentContextCode,
  };
  const paymentId = getPaymentId().paymentId;
  const checkDataId = getCheckData().id;
  const rptId: RptId = `${noticeInfo.cf}${noticeInfo.billCode}`;
  const config = getConfigOrThrow();
  const getWallet = () => {
    void getSessionWallet(wallet as InputCardFormFields, onError, onResponse);
  };
  if (paymentId && checkDataId) {
    getWallet();
  }
  if (paymentId && !checkDataId) {
    void getPaymentCheckData({
      idPayment: paymentId,
      onError,
      onResponse: getWallet,
      onNavigate,
    });
  }
  if (!paymentId) {
    pipe(
      PaymentRequestsGetResponse.decode(paymentInfoTransform),
      E.fold(
        () => onError(ErrorsType.INVALID_DECODE),
        (response) =>
          pipe(
            activePaymentTask(
              response.importoSingoloVersamento,
              response.codiceContestoPagamento,
              rptId,
              token
            ),
            TE.fold(
              (e: string) => async () => {
                onError(e);
              },
              () => async () => {
                void pollingActivationStatus(
                  response.codiceContestoPagamento,
                  config.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS as number,
                  (res) => {
                    setPaymentId({ paymentId: res.idPagamento });
                    void getPaymentCheckData({
                      idPayment: res.idPagamento,
                      onError,
                      onResponse: getWallet,
                      onNavigate,
                    });
                  },
                  onError
                );
              }
            )
          )()
      )
    );
  }
};

export const activePaymentTask = (
  amountSinglePayment: ImportoEuroCents,
  paymentContextCode: CodiceContestoPagamento,
  rptId: RptId,
  recaptchaResponse: string
): TE.TaskEither<string, PaymentActivationsPostResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_ACTIVATE_INIT.value, {
          EVENT_ID: PAYMENT_ACTIVATE_INIT.value,
        });
        return apiPaymentActivationsClient.activatePayment({
          recaptchaResponse,
          body: {
            rptId,
            importoSingoloVersamento: amountSinglePayment,
            codiceContestoPagamento: paymentContextCode,
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
              const reason =
                responseType.status === 200 ? "" : responseType.value?.detail;
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_ACTIVATE_SUCCESS.value
                  : PAYMENT_ACTIVATE_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID, reason });

              if (responseType.status === 400) {
                return TE.left(
                  pipe(
                    O.fromNullable(responseType.value?.detail as Detail_v2Enum),
                    O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                  )
                );
              }
              return responseType.status !== 200
                ? TE.left(
                    pipe(
                      O.fromNullable(responseType.value?.detail),
                      O.getOrElse(() => ErrorsType.STATUS_ERROR as string)
                    )
                  )
                : TE.of(responseType.value);
            }
          )
        )
    )
  );

export const getActivationStatusTask = (
  paymentContextCode: CodiceContestoPagamento
): TE.TaskEither<string, PaymentActivationsGetResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        mixpanel.track(PAYMENT_ACTIVATION_STATUS_INIT.value, {
          EVENT_ID: PAYMENT_ACTIVATION_STATUS_INIT.value,
        });
        return apiPaymentActivationsClient.getActivationStatus({
          codiceContestoPagamento: paymentContextCode,
        });
      },
      () => {
        mixpanel.track(PAYMENT_ACTIVATION_STATUS_NET_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATION_STATUS_NET_ERR.value,
        });
        return "Errore stato pagamento";
      }
    ),
    TE.fold(
      (err) => {
        mixpanel.track(PAYMENT_ACTIVATION_STATUS_SVR_ERR.value, {
          EVENT_ID: PAYMENT_ACTIVATION_STATUS_SVR_ERR.value,
        });
        return TE.left(err);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left("Errore stato pagamento"),
            (responseType) => {
              const EVENT_ID: string =
                responseType.status === 200
                  ? PAYMENT_ACTIVATION_STATUS_SUCCESS.value
                  : PAYMENT_ACTIVATION_STATUS_RESP_ERR.value;
              mixpanel.track(EVENT_ID, { EVENT_ID });

              return responseType.status !== 200
                ? TE.left(`Errore stato pagamento : ${responseType.status}`)
                : TE.of(responseType.value);
            }
          )
        )
    )
  );
export const pollingActivationStatus = async (
  paymentNoticeCode: CodiceContestoPagamento,
  attempts: number,
  onResponse: (activationResponse: { idPagamento: any }) => void,
  onError: (e: string) => void
): Promise<void> => {
  await pipe(
    getActivationStatusTask(paymentNoticeCode),
    TE.match(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      attempts > 0
        ? setTimeout(
            pollingActivationStatus,
            getConfigOrThrow()
              .CHECKOUT_POLLING_ACTIVATION_INTERVAL as Millisecond,
            paymentNoticeCode,
            --attempts, // eslint-disable-line no-param-reassign,
            onResponse,
            onError
          )
        : onError(ErrorsType.TIMEOUT);
    }, onResponse)
  )();
};

export const retryPollingActivationStatus = async ({
  wallet,
  onResponse,
  onError,
  onNavigate,
}: {
  wallet: InputCardFormFields;
  onResponse: (cardData: {
    pan: string;
    expDate: string;
    cardHolderName: string;
    cvv: string;
  }) => void;
  onError: (e: string) => void;
  onNavigate: () => void;
}): Promise<void> => {
  const paymentInfo = getPaymentInfo();
  const paymentInfoTransform = {
    importoSingoloVersamento: paymentInfo.amount,
    codiceContestoPagamento: paymentInfo.paymentContextCode,
  };
  const config = getConfigOrThrow();
  const getWallet = () => {
    void getSessionWallet(wallet as InputCardFormFields, onError, onResponse);
  };

  pipe(
    PaymentRequestsGetResponse.decode(paymentInfoTransform),
    E.fold(
      () => onError(ErrorsType.INVALID_DECODE),
      (response) =>
        pollingActivationStatus(
          response.codiceContestoPagamento,
          config.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS as number,
          // eslint-disable-next-line sonarjs/no-identical-functions
          (res) => {
            setPaymentId({ paymentId: res.idPagamento });
            void getPaymentCheckData({
              idPayment: res.idPagamento,
              onError,
              onResponse: getWallet,
              onNavigate,
            });
          },
          onError
        )
    )
  );
};

export const getPaymentCheckData = async ({
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
              pmClient.checkPaymentUsingGET({
                id: pipe(
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
                    const maybePayment = PaymentSession.decode(
                      response.value?.data
                    );

                    // eslint-disable-next-line no-underscore-dangle
                    if (response.status === 200) {
                      pipe(
                        maybePayment,
                        E.map((payment) => {
                          sessionStorage.setItem(
                            "checkData",
                            JSON.stringify(payment)
                          );
                          onResponse();
                          mixpanel.track(PAYMENT_CHECK_SUCCESS.value, {
                            EVENT_ID: PAYMENT_CHECK_SUCCESS.value,
                          });

                          const cart = getCart();
                          setReturnUrls(
                            cart?.returnUrls.returnOkUrl
                              ? cart.returnUrls
                              : {
                                  returnOkUrl: "/",
                                  returnCancelUrl: "/",
                                  returnErrorUrl: "/",
                                }
                          );
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
};

export const getPaymentPSPList = async ({
  paymentMethodId,
  onError,
  onResponse,
}: {
  paymentMethodId: string;
  onError: (e: string) => void;
  onResponse: (r: Array<PspList>) => void;
}) => {
  const amount: number | undefined = pipe(
    O.fromNullable(getCart()),
    O.map((cart) =>
      cart.paymentNotices.reduce(
        (totalAmount, notice) => totalAmount + notice.amount,
        0
      )
    ),
    O.alt(() =>
      pipe(
        O.fromNullable(getPaymentInfo()),
        O.map((paymentInfo) => paymentInfo.amount)
      )
    ),
    O.getOrElseW(() => undefined)
  );

  // const sessionToken =
  //   sessionStorage.getItem("sessionToken") || JSON.stringify("");
  // const Bearer = `Bearer ${sessionToken}`;
  const lang = "it";

  mixpanel.track(PAYMENT_PSPLIST_INIT.value, {
    EVENT_ID: PAYMENT_PSPLIST_INIT.value,
  });
  const pspList = await pipe(
    TE.tryCatch(
      () =>
        apiPaymentEcommerceClient.getPaymentMethodsPSPs({
          amount,
          lang,
          id: paymentMethodId,
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
        return undefined;
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
                return myRes?.value.psp;
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                mixpanel.track(PAYMENT_PSPLIST_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_PSPLIST_RESP_ERR.value,
                });
                return [];
              }
            }
          )
        )
    )
  )();

  const psp = pspList?.map((e) => ({
    name: e?.businessName,
    label: e?.businessName,
    image: undefined, // image: e?.logoPSP, TODO capire come gestire i loghi
    commission: e?.fixedCost ?? 0,
    idPsp: Number(e?.code), // TODO capire se gestirlo come stringa o come number
  }));

  onResponse(psp || []);
};

export const getSessionWallet = async (
  creditCard: InputCardFormFields,
  onError: (e: string) => void,
  onResponse: (cardData: {
    pan: string;
    expDate: string;
    cvv: string;
    cardHolderName: string;
  }) => void
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const useremail: string = JSON.parse(
    sessionStorage.getItem("useremail") || JSON.stringify("")
  );
  const checkDataStored: string =
    sessionStorage.getItem("checkData") || JSON.stringify("{}");
  const checkData = JSON.parse(checkDataStored);

  mixpanel.track(PAYMENT_START_SESSION_INIT.value, {
    EVENT_ID: PAYMENT_START_SESSION_INIT.value,
  });
  // 1. Start Session to Fetch session token
  const mySessionToken = await pipe(
    TE.tryCatch(
      () =>
        pmClient.startSessionUsingPOST({
          startSessionRequest: {
            data: {
              email: pipe(
                O.fromNullable(useremail),
                O.getOrElse(() => "")
              ),
              idPayment: pipe(
                O.fromNullable(checkData.idPayment),
                O.getOrElse(() => "")
              ),
            },
          },
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_START_SESSION_NET_ERR.value, {
          EVENT_ID: PAYMENT_START_SESSION_NET_ERR.value,
        });
        return toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_START_SESSION_SVR_ERR.value, {
          EVENT_ID: PAYMENT_START_SESSION_SVR_ERR.value,
        });
        return "fakeSessionToken";
      }, // to be replaced with logic to handle failures
      (myResExt) => async () => {
        const sessionToken = pipe(
          myResExt,
          E.fold(
            () => "fakeSessionToken",
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(PAYMENT_START_SESSION_SUCCESS.value, {
                  EVENT_ID: PAYMENT_START_SESSION_SUCCESS.value,
                });
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                mixpanel.track(PAYMENT_START_SESSION_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_START_SESSION_RESP_ERR.value,
                });
              }
              return myRes.status === 200
                ? pipe(
                    O.fromNullable(myRes.value.sessionToken),
                    O.getOrElse(() => "fakeSessionToken")
                  )
                : "fakeSessionToken";
            }
          )
        );
        if (sessionToken !== "fakeSessionToken") {
          sessionStorage.setItem("sessionToken", sessionToken);
        }
        return sessionToken;
      }
    )
  )();

  if (mySessionToken === "fakeSessionToken") {
    return;
  }

  mixpanel.track(PAYMENT_APPROVE_TERMS_INIT.value, {
    EVENT_ID: PAYMENT_APPROVE_TERMS_INIT.value,
  });
  // 2. Approve Terms
  const termsApproval = await pipe(
    TE.tryCatch(
      () =>
        pmClient.approveTermsUsingPOST({
          Bearer: `Bearer ${mySessionToken}`,
          approveTermsRequest: {
            data: {
              terms: true,
              privacy: true,
            },
          },
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_APPROVE_TERMS_NET_ERR.value, {
          EVENT_ID: PAYMENT_APPROVE_TERMS_NET_ERR.value,
        });
        return "noApproval";
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_APPROVE_TERMS_SVR_ERR.value, {
          EVENT_ID: PAYMENT_APPROVE_TERMS_SVR_ERR.value,
        });
        return "noApproval";
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => "noApproval",
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(PAYMENT_APPROVE_TERMS_SUCCESS.value, {
                  EVENT_ID: PAYMENT_APPROVE_TERMS_SUCCESS.value,
                });
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                mixpanel.track(PAYMENT_APPROVE_TERMS_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_APPROVE_TERMS_RESP_ERR.value,
                });
              }
              return myRes.status === 200
                ? JSON.stringify(myRes.value.data)
                : "noApproval";
            }
          )
        )
    )
  )();

  if (termsApproval === "noApproval") {
    return;
  }

  mixpanel.track(PAYMENT_WALLET_INIT.value, {
    EVENT_ID: PAYMENT_WALLET_INIT.value,
  });
  // 3. Wallet
  await pipe(
    TE.tryCatch(
      () =>
        pmClient.addWalletUsingPOST({
          Bearer: `Bearer ${mySessionToken}`,
          walletRequest: {
            data: {
              type: TypeEnum.CREDIT_CARD,
              creditCard: {
                expireMonth: creditCard.expirationDate.split("/")[0],
                expireYear: creditCard.expirationDate.split("/")[1],
                holder: creditCard.name.trim(),
                pan: creditCard.number.trim(),
                securityCode: creditCard.cvv,
              },
              idPagamentoFromEC: checkData.idPayment, // needs to exist
            },
          },
          language: "it",
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_WALLET_NET_ERR.value, {
          EVENT_ID: PAYMENT_WALLET_NET_ERR.value,
        });
        return toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_WALLET_SVR_ERR.value, {
          EVENT_ID: PAYMENT_WALLET_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => async () => {
        const walletResp = pipe(
          myResExt,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              mixpanel.track(PAYMENT_WALLET_RESP_ERR.value, {
                EVENT_ID: PAYMENT_WALLET_RESP_ERR.value,
              });
            },
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(PAYMENT_WALLET_SUCCESS.value, {
                  EVENT_ID: PAYMENT_WALLET_SUCCESS.value,
                });
              } else {
                onError(ErrorsType.INVALID_CARD);
                mixpanel.track(PAYMENT_WALLET_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_WALLET_RESP_ERR.value,
                });
              }
              return myRes.status === 200
                ? JSON.stringify(myRes.value.data)
                : "fakeWallet";
            }
          )
        );

        if ((walletResp as any as string) !== "fakeWallet") {
          pipe(
            WalletSession.decode(JSON.parse(walletResp as any as string)),
            E.map((wallet) => {
              sessionStorage.setItem("wallet", JSON.stringify(wallet));
            })
          );
          onResponse({
            pan: creditCard.number,
            cvv: creditCard.cvv,
            cardHolderName: creditCard.name,
            expDate: creditCard.expirationDate,
          });
        }
      }
    )
  )();
};

export const updateWallet = async (
  idPsp: number,
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const walletStored = sessionStorage.getItem("wallet") || JSON.stringify("{}");
  const sessionToken =
    sessionStorage.getItem("sessionToken") || JSON.stringify("");

  const wallet = JSON.parse(walletStored);

  const Bearer = `Bearer ${sessionToken}`;
  const idWallet = wallet.idWallet;

  mixpanel.track(PAYMENT_UPD_WALLET_INIT.value, {
    EVENT_ID: PAYMENT_UPD_WALLET_INIT.value,
  });
  await pipe(
    TE.tryCatch(
      () =>
        pmClient.updateWalletUsingPUT({
          Bearer,
          id: idWallet,
          walletRequest: {
            data: {
              idPsp,
            },
          },
        }),
      (_e) => {
        onError(ErrorsType.GENERIC_ERROR);
        mixpanel.track(PAYMENT_UPD_WALLET_NET_ERR.value, {
          EVENT_ID: PAYMENT_UPD_WALLET_NET_ERR.value,
        });
        return toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.GENERIC_ERROR);
        mixpanel.track(PAYMENT_UPD_WALLET_SVR_ERR.value, {
          EVENT_ID: PAYMENT_UPD_WALLET_SVR_ERR.value,
        });
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () =>
              mixpanel.track(PAYMENT_UPD_WALLET_RESP_ERR.value, {
                EVENT_ID: PAYMENT_UPD_WALLET_RESP_ERR.value,
              }),
            (res) => {
              pipe(
                WalletSession.decode(res.value?.data),
                E.fold(
                  (_) => undefined,
                  (wallet) => {
                    mixpanel.track(PAYMENT_UPD_WALLET_SUCCESS.value, {
                      EVENT_ID: PAYMENT_UPD_WALLET_SUCCESS.value,
                    });
                    sessionStorage.setItem("wallet", JSON.stringify(wallet));
                    onResponse();
                  }
                )
              );
            }
          )
        )
    )
  )();
};

export const confirmPayment = async (
  {
    checkData,
    wallet,
    cvv,
  }: {
    checkData: PaymentCheckData;
    wallet: PaymentWallet;
    cvv: string;
  },
  onError: (e: string) => void,
  onResponse: () => void
) => {
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
    acctID: `ACCT_${(
      JSON.parse(
        pipe(
          O.fromNullable(sessionStorage.getItem("wallet")),
          O.getOrElse(() => JSON.stringify("{}"))
        )
      ) as Wallet
    ).idWallet
      ?.toString()
      .trim()}`,
    deliveryEmailAddress: pipe(
      O.fromNullable(
        JSON.parse(sessionStorage.getItem("useremail") || JSON.stringify(""))
      ),
      O.getOrElse(() => JSON.stringify(""))
    ),
    mobilePhone: null,
  };

  mixpanel.track(PAYMENT_PAY3DS2_INIT.value, {
    EVENT_ID: PAYMENT_PAY3DS2_INIT.value,
  });
  // Pay
  await pipe(
    TE.tryCatch(
      () =>
        pmClient.pay3ds2UsingPOST({
          Bearer: `Bearer ${sessionStorage.getItem("sessionToken")}`,
          id: checkData.idPayment,
          payRequest: {
            data: {
              tipo: "web",
              idWallet: wallet.idWallet,
              cvv: pipe(
                O.fromNullable(cvv),
                O.getOrElse(() => "")
              ),
              threeDSData: JSON.stringify(threeDSData),
            },
          },
          language: "it",
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_PAY3DS2_NET_ERR.value, {
          EVENT_ID: PAYMENT_PAY3DS2_NET_ERR.value,
        });
        return toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_PAY3DS2_SVR_ERR.value, {
          EVENT_ID: PAYMENT_PAY3DS2_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => async () => {
        const paymentResp = pipe(
          myResExt,
          E.fold(
            () => "fakePayment",
            (myRes) => {
              if (myRes.status === 200) {
                mixpanel.track(PAYMENT_PAY3DS2_SUCCESS.value, {
                  EVENT_ID: PAYMENT_PAY3DS2_SUCCESS.value,
                });
                return JSON.stringify(myRes.value.data);
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                mixpanel.track(PAYMENT_PAY3DS2_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_PAY3DS2_RESP_ERR.value,
                });
                return "fakePayment";
              }
            }
          )
        );
        if (paymentResp !== "fakePayment") {
          sessionStorage.setItem(
            "idTransaction",
            JSON.parse(paymentResp).token
          );
          onResponse();
        }
      }
    )
  )();
};

export const cancelPayment = async (
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const checkData = JSON.parse(
    sessionStorage.getItem("checkData") || JSON.stringify("{}")
  );

  // Payment action DELETE
  mixpanel.track(PAYMENT_ACTION_DELETE_INIT.value, {
    EVENT_ID: PAYMENT_ACTION_DELETE_INIT.value,
  });

  const eventResult:
    | PAYMENT_ACTION_DELETE_NET_ERR
    | PAYMENT_ACTION_DELETE_SVR_ERR
    | PAYMENT_ACTION_DELETE_RESP_ERR
    | PAYMENT_ACTION_DELETE_SUCCESS = await pipe(
    TE.tryCatch(
      () =>
        pmClient.deleteBySessionCookieExpiredUsingDELETE({
          Bearer: `Bearer ${sessionStorage.getItem("sessionToken")}`,
          id: checkData.idPayment,
          koReason: "ANNUTE",
          showWallet: false,
        }),
      () => PAYMENT_ACTION_DELETE_NET_ERR.value
    ),
    TE.fold(
      () => async () => PAYMENT_ACTION_DELETE_SVR_ERR.value,
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => PAYMENT_ACTION_DELETE_RESP_ERR.value,
            (myRes) =>
              myRes.status === 200
                ? PAYMENT_ACTION_DELETE_SUCCESS.value
                : PAYMENT_ACTION_DELETE_RESP_ERR.value
          )
        )
    )
  )();

  mixpanel.track(eventResult, { EVENT_ID: eventResult });

  if (E.isRight(PAYMENT_ACTION_DELETE_SUCCESS.decode(eventResult))) {
    onResponse();
  } else if (E.isRight(PAYMENT_ACTION_DELETE_NET_ERR.decode(eventResult))) {
    onError(ErrorsType.CONNECTION);
  } else if (E.isRight(PAYMENT_ACTION_DELETE_SVR_ERR.decode(eventResult))) {
    onError(ErrorsType.SERVER);
  } else {
    onError(ErrorsType.GENERIC_ERROR);
  }
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
                return myRes.value
                  .filter(
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
