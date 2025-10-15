/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import featureFlags from "../../../../utils/featureFlags";
import { getEnumFromString } from "../../../../utils/enum/enumerationUtils";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV2,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientV4,
  apiPaymentEcommerceClientWithRetry,
  apiPaymentEcommerceClientWithRetryV2,
  apiPaymentEcommerceClientWithRetryV3,
} from "../../../../utils/api/client";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import {
  Cart,
  PaymentInstrumentsType,
  PaymentMethod,
  PaymentMethodInfo,
  PaymentInfo,
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
import {
  PaymentMethodsRequest as PaymentMethodsRequestV2,
  UserTouchpointEnum,
} from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodsRequest";
import { PaymentMethodsRequest as PaymentMethodsRequestV4 } from "../../../../../generated/definitions/payment-ecommerce-v4/PaymentMethodsRequest";
import { PaymentNoticeItem } from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentNoticeItem";
import {
  MethodManagementEnum,
  PaymentTypeCodeEnum,
} from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import { evaluateFeatureFlag } from "../checkoutFeatureFlagsHelper";

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

const getPaymentMethods = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void
) =>
  pipe(
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
                  return myRes.value.paymentMethods?.map(
                    (p) =>
                      ({
                        id: p.id,
                        name: {
                          IT: p.name,
                        },
                        description: {
                          IT: p.description,
                        },
                        status: p.status,
                        paymentTypeCode: getEnumFromString(
                          PaymentTypeCodeEnum,
                          p.paymentTypeCode
                        ),
                        methodManagement: getEnumFromString(
                          MethodManagementEnum,
                          p.methodManagement
                        ),
                        feeRange: undefined,
                        asset: p.asset,
                        brandAsset: p.brandAssets,
                      } as PaymentInstrumentsType)
                  );
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

export const getPaymentMethodHandler = async (onError: (e: string) => void) =>
  pipe(
    TE.tryCatch(
      () =>
        pipe(
          getSessionItem(SessionItems.authToken) as string,
          O.fromNullable,
          O.fold(
            () =>
              apiPaymentEcommerceClientV2.getAllPaymentMethods({
                body: buildPaymentInstrumentMethodHandlerSearchRequest(),
              }),
            (bearerAuth) =>
              apiPaymentEcommerceClientV4.getAllPaymentMethodsAuth({
                "x-rpt-ids": getRptIdsFromSession(),
                bearerAuth,
                body: buildPaymentInstrumentMethodHandlerSearchRequest() as any as PaymentMethodsRequestV4,
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
                  return myRes.value.paymentMethods.map(
                    (p) =>
                      ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        status: p.status,
                        methodManagement: p.methodManagement,
                        paymentTypeCode: p.paymentTypeCode,
                        feeRange: p.feeRange,
                        asset: p.paymentMethodAsset,
                        brandAsset: p.paymentMethodsBrandAssets,
                        paymentMethodTypes: p.paymentMethodTypes,
                        metadata: p.metadata,
                      } as PaymentInstrumentsType)
                  );
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

const buildPaymentInstrumentMethodHandlerSearchRequest =
  (): PaymentMethodsRequestV2 => {
    const transaction = getSessionItem(SessionItems.transaction) as
      | NewTransactionResponse
      | undefined;
    const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
    const paymentInfo = getSessionItem(SessionItems.paymentInfo) as PaymentInfo;
    const cartClientId = getSessionItem(SessionItems.cartClientId) as
      | string
      | undefined;
    // eslint-disable-next-line functional/no-let
    let userTouchpoint = UserTouchpointEnum.CHECKOUT;
    switch (cartClientId) {
      case "CHECKOUT":
        userTouchpoint = UserTouchpointEnum.CHECKOUT;
        break;
      case "CHECKOUT_CART":
      case "WISP_REDIRECT":
        userTouchpoint = UserTouchpointEnum.CHECKOUT_CART;
        break;
      default:
        userTouchpoint = UserTouchpointEnum.CHECKOUT;
        break;
    }
    // eslint-disable-next-line functional/no-let
    let totalAmount: number;
    // eslint-disable-next-line functional/no-let
    let paymentNotices: Array<PaymentNoticeItem>;
    // eslint-disable-next-line functional/no-let
    let allCCp: boolean | undefined;
    // if transaction is activated take amount from transaction object (that is actualizated)
    if (
      transaction &&
      transaction.payments &&
      transaction.payments.length > 0
    ) {
      totalAmount = transaction.payments.reduce(
        (sum: number, payment) => sum + Number(payment.amount),
        0
      );
      paymentNotices = transaction.payments.map((p) => ({
        paymentAmount: p.amount,
        primaryCreditorInstitution: p.rptId.substring(0, 11),
        transferList: p.transferList.map((t) => ({
          creditorInstitution: t.paFiscalCode,
          digitalStamp: t.digitalStamp,
          transferCategory: t.transferCategory,
        })),
      }));
      allCCp = transaction.payments[0].isAllCCP;
    }
    // otherwise check if we are in a cart payment
    else if (cart) {
      totalAmount = cart.paymentNotices.reduce(
        (sum: number, payment) => sum + Number(payment.amount),
        0
      );
      paymentNotices = cart.paymentNotices.map((p) => ({
        paymentAmount: p.amount,
        primaryCreditorInstitution: p.fiscalCode,
      }));
    }
    // or in a single payment notice case
    else {
      totalAmount = paymentInfo.amount;
      paymentNotices = [
        {
          paymentAmount: paymentInfo.amount,
          primaryCreditorInstitution: paymentInfo.rptId?.substring(0, 11) ?? "",
        },
      ];
    }
    return {
      userTouchpoint,
      totalAmount,
      paymentNotice: paymentNotices,
      allCCp,
    };
  };

const evaluatePaymentMethodHandlerEnabledFF = async (): Promise<boolean> => {
  // eslint-disable-next-line functional/no-let
  let featureFlag = getSessionItem(
    SessionItems.enablePaymentMethodsHandler
  ) as string;
  if (featureFlag === null || featureFlag === undefined) {
    // ff not found in session storage, invoking ff api
    await evaluateFeatureFlag(
      featureFlags.enablePaymentMethodsHandler,
      (e: string) => {
        // eslint-disable-next-line no-console
        console.error(
          `Error while getting feature flag ${featureFlags.enablePaymentMethodsHandler}`,
          e
        );
      },
      (data: { enabled: boolean }) => {
        setSessionItem(
          SessionItems.enablePaymentMethodsHandler,
          data.enabled.toString()
        );
        featureFlag = data.enabled.toString();
      }
    );
  }
  return featureFlag === "true";
};
/*
const evaluateWalletEnabledFF = async (): Promise<boolean> => {
  // eslint-disable-next-line functional/no-let
  let featureFlag = getSessionItem(SessionItems.enableWallet) as string;
  if (featureFlag === null || featureFlag === undefined) {
    // ff not found in session storage, invoking ff api
    await evaluateFeatureFlag(
      featureFlags.enableWallet,
      (e: string) => {
        // eslint-disable-next-line no-console
        console.error(
          `Error while getting feature flag ${featureFlags.enableWallet}`,
          e
        );
      },
      (data: { enabled: boolean }) => {
        setSessionItem(SessionItems.enableWallet, data.enabled.toString());
        featureFlag = data.enabled.toString();
      }
    );
  }
  return featureFlag === "true";
};
*/
export const getPaymentInstruments = async (
  query: {
    amount: number;
  },
  onError: (e: string) => void,
  onResponse: (data: Array<PaymentInstrumentsType>) => void
) => {
  const list = await pipe(
    await evaluatePaymentMethodHandlerEnabledFF(),
    O.fromNullable,
    O.filter((ff) => ff),
    O.foldW(
      () => getPaymentMethods(query, onError),
      () => getPaymentMethodHandler(onError)
    )
  );
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
