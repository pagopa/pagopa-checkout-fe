/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientV4,
  apiPaymentEcommerceClientWithRetry,
  apiPaymentEcommerceClientWithRetryV2,
  apiPaymentEcommerceClientWithRetryV3,
} from "../../../../utils/api/client";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import {
  PaymentInstrumentsType,
  PaymentMethod,
  PaymentMethodInfo,
} from "../../../../features/payment/models/paymentModel";
import { validateSessionWalletCardFormFields } from "../../../../utils/regex/validators";
import {
  getRptIdsFromSession,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { CalculateFeeRequest } from "../../../../../generated/definitions/payment-ecommerce-v2/CalculateFeeRequest";
import { CreateSessionResponse } from "../../../../../generated/definitions/payment-ecommerce/CreateSessionResponse";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce-v2/Bundle";
import { CalculateFeeResponse } from "../../../../../generated/definitions/payment-ecommerce-v2/CalculateFeeResponse";

// ->Promise<Either<string,SessionPaymentMethodResponse>>
export const retrieveCardData = async ({
  paymentId,
  orderId,
  onError,
  onResponseSessionPaymentMethod,
}: {
  paymentId: string;
  orderId: string;
  onError: (e: string) => void;
  onResponseSessionPaymentMethod: (r: any) => void;
}) => {
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

  const sessionPaymentMethod = await pipe(
    TE.tryCatch(
      () =>
        apiPaymentEcommerceClient.getSessionPaymentMethod({
          bearerAuth,
          id: paymentId,
          orderId,
          "x-transaction-id-from-client": transactionId,
        }),
      (_e) => {
        onError(ErrorsType.CONNECTION);
        return E.toError;
      }
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        return {};
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => [onError(ErrorsType.GENERIC_ERROR)],
            (myRes) => {
              if (myRes?.status === 200) {
                const sessionPaymentMethodResponse = myRes?.value;
                setSessionItem(
                  SessionItems.sessionPaymentMethod,
                  sessionPaymentMethodResponse
                );
                setSessionItem(SessionItems.paymentMethodInfo, {
                  title: `· · · · ${sessionPaymentMethodResponse.lastFourDigits}`,
                  body: sessionPaymentMethodResponse.expiringDate,
                  icon: sessionPaymentMethodResponse.brand,
                } as PaymentMethodInfo);
                return sessionPaymentMethodResponse;
              } else {
                onError(ErrorsType.GENERIC_ERROR);
                return {};
              }
            }
          )
        )
    )
  )();

  onResponseSessionPaymentMethod(sessionPaymentMethod);
};

// -> Promise<Either<string, BundleOptions>>
export const calculateFees = async ({
  paymentId,
  bin,
  onError,
  onPspNotFound,
  onResponsePsp,
}: {
  paymentId: string;
  bin?: string;
  onError: (e: string) => void;
  onPspNotFound: () => void;
  onResponsePsp: (r: any) => void;
}) => {
  const calculateFeeRequest: O.Option<CalculateFeeRequest> = pipe(
    getSessionItem(SessionItems.transaction) as NewTransactionResponse,
    O.fromNullable,
    O.map((transaction) => ({
      bin,
      touchpoint: transaction.clientId || "CHECKOUT",
      paymentNotices: transaction.payments.map((payment) => ({
        paymentAmount: payment.amount,
        primaryCreditorInstitution: payment.rptId.substring(0, 11),
        transferList: payment.transferList.map((transfer) => ({
          creditorInstitution: transfer.paFiscalCode,
          digitalStamp: transfer.digitalStamp,
          transferCategory: transfer.transferCategory,
        })),
      })),
      isAllCCP: transaction.payments[0].isAllCCP,
    }))
  );

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

  const MAX_OCCURENCES_AFM = 2147483647;
  await pipe(
    calculateFeeRequest,
    TE.fromOption(() => {
      onError(ErrorsType.GENERIC_ERROR);
      return E.toError;
    }),
    TE.chain((calculateFeeRequest) =>
      TE.tryCatch(
        () =>
          apiPaymentEcommerceClientWithRetryV2.calculateFees({
            bearerAuth,
            "x-transaction-id-from-client": transactionId,
            id: paymentId,
            maxOccurrences: MAX_OCCURENCES_AFM,
            body: calculateFeeRequest,
          }),
        (_e) => {
          onError(ErrorsType.CONNECTION);
          return E.toError;
        }
      )
    ),
    TE.fold(
      (_r) => async () => {
        onError(ErrorsType.SERVER);
        return {};
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => [],
            (myRes) => {
              if (myRes?.status === 200) {
                onResponsePsp(myRes?.value);
              } else if (myRes?.status === 404) {
                onPspNotFound();
              } else {
                onError(ErrorsType.GENERIC_ERROR);
              }
              return {};
            }
          )
        )
    )
  )();
};

export const getPaymentInstruments = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void,
  onResponse: (data: Array<PaymentInstrumentsType>) => void
) => {
  const isPaymentMethodsHandlerEnabled =
    (getSessionItem(SessionItems.enablePaymentMethodsHandler) as string) ===
    "true";

  if (isPaymentMethodsHandlerEnabled) {
    await getPaymentInstrumentsWithHandler(query, onError, onResponse);
  } else {
    await getPaymentInstrumentsLegacy(query, onError, onResponse);
  }
};

const getPaymentInstrumentsLegacy = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void,
  onResponse: (data: Array<PaymentInstrumentsType>) => void
) => {
  const list = await pipe(
    TE.tryCatch(
      () =>
        pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () => apiPaymentEcommerceClient.getAllPaymentMethods(query),
            (bearerAuth) =>
              apiPaymentEcommerceClientV3.getAllPaymentMethodsV3({
                "x-rpt-ids": getRptIdsFromSession(),
                bearerAuth,
                ...query,
              })
          )
        ),
      () => {
        onError(ErrorsType.STATUS_ERROR);
        return E.toError;
      }
    ),
    TE.fold(
      () => async () => {
        onError(ErrorsType.STATUS_ERROR);
        return [];
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return [];
            },
            (myRes) => {
              switch (myRes.status) {
                case 200:
                  return myRes.value.paymentMethods;
                case 401:
                  onError(ErrorsType.UNAUTHORIZED);
                  return [];
                default:
                  return [];
              }
            }
          )
        )
    )
  )();
  onResponse(list as any as Array<PaymentInstrumentsType>);
};

const getPaymentInstrumentsWithHandler = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void,
  onResponse: (data: Array<PaymentInstrumentsType>) => void
) => {
  const transaction = getSessionItem(SessionItems.transaction) as NewTransactionResponse | null;

  // build the request payload for the new POST API
  const buildPostPaymentMethodsRequest = () => {
    // map client id: if present use CHECKOUT_CART, if not present use CHECKOUT
    const sessionClientId = transaction?.clientId;
    const clientId = sessionClientId ? "CHECKOUT_CART" : "CHECKOUT";

    const baseRequest = {
      clientId,
      totalAmount: query.amount,
    };

    // at least one activation completed -> populate paymentNotice and transferList
    if (
      transaction &&
      transaction.payments &&
      transaction.payments.length > 0
    ) {
      const firstPayment = transaction.payments[0];
      return {
        ...baseRequest,
        paymentNotice: {
          rptId: firstPayment.rptId,
          amount: firstPayment.amount,
        },
        // transferList: only populate if present in payment data, otherwise null
        transferList: firstPayment.transferList || null,
      };
    }

    // for contexts before at least one activation, both paymentNotice and transferList are null
    return {
      ...baseRequest,
      paymentNotice: null,
      transferList: null,
    };
  };

  const list = await pipe(
    TE.tryCatch(
      () =>
        pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () => apiPaymentEcommerceClientV4.getAllPaymentMethodsAuth({
              body: buildPostPaymentMethodsRequest(),
            }),
            (bearerAuth) =>
              apiPaymentEcommerceClientV4.getAllPaymentMethodsAuth({
                "x-rpt-ids": getRptIdsFromSession(),
                bearerAuth,
                body: buildPostPaymentMethodsRequest(),
              })
          )
        ),
      () => {
        onError(ErrorsType.STATUS_ERROR);
        return E.toError;
      }
    ),
    TE.fold(
      () => async () => {
        onError(ErrorsType.STATUS_ERROR);
        return [];
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return [];
            },
            (myRes) => {
              switch (myRes.status) {
                case 200:
                  return myRes.value.paymentMethods;
                case 401:
                  onError(ErrorsType.UNAUTHORIZED);
                  return [];
                default:
                  return [];
              }
            }
          )
        )
    )
  )();
  onResponse(list as any as Array<PaymentInstrumentsType>);
};

export const npgSessionsFields = async (
  onError: (e: string) => void,
  onResponse: (data: CreateSessionResponse) => void
) =>
  await pipe(
    TE.tryCatch(
      () => {
        const paymentMethodId =
          (
            getSessionItem(SessionItems.paymentMethod) as
              | PaymentMethod
              | undefined
          )?.paymentMethodId || "";
        const payload = {
          id: paymentMethodId,
          lang: localStorage.getItem("i18nextLng") ?? "it",
        };
        return pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () =>
              apiPaymentEcommerceClientWithRetry.createSession({
                ...payload,
              }),
            (bearerAuth) =>
              apiPaymentEcommerceClientWithRetryV3.createSessionV3({
                "x-rpt-ids": getRptIdsFromSession(),
                bearerAuth,
                ...payload,
              })
          )
        );
      },
      () => {
        onError("NPG_NET_ERR");
        return "NPG_NET_ERR";
      }
    ),
    TE.fold(
      (err) => TE.left(err),
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => ({}),
            (myRes) => {
              switch (myRes.status) {
                case 200:
                  pipe(
                    myRes.value.paymentMethodData.form,
                    validateSessionWalletCardFormFields,
                    O.match(
                      () => onError("NPG_RESP_ERROR"),
                      () => onResponse(myRes.value)
                    )
                  );
                  return myRes;
                case 401:
                  onError(ErrorsType.UNAUTHORIZED);
                  return {};
                default:
                  return {};
              }
            }
          )
        )
    )
  )();

export const getFees = (
  onSuccess: (value: boolean) => void,
  onPspNotFound: () => void,
  onError: (m: string) => void,
  bin?: string
) =>
  calculateFees({
    paymentId:
      (getSessionItem(SessionItems.paymentMethod) as PaymentMethod | undefined)
        ?.paymentMethodId || "",
    bin,
    onError,
    onPspNotFound,
    onResponsePsp: (resp) => {
      pipe(
        resp,
        CalculateFeeResponse.decode,
        O.fromEither,
        O.chain((resp) => O.fromNullable(resp.belowThreshold)),
        O.fold(
          () => onError(ErrorsType.GENERIC_ERROR),
          (value) => {
            const firstPsp = pipe(
              resp?.bundles,
              O.fromNullable,
              O.chain((sortedArray) => O.fromNullable(sortedArray[0])),
              O.map((a) => a as Bundle),
              O.getOrElseW(() => ({}))
            );

            setSessionItem(SessionItems.pspSelected, firstPsp);
            onSuccess(value);
          }
        )
      );
    },
  });
