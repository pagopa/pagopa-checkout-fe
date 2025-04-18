/* eslint-disable functional/immutable-data */
/* eslint-disable no-bitwise */
/* eslint @typescript-eslint/no-var-requires: "off" */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import { createCounter } from "../../utils/counter";
import {
  THREEDSACSCHALLENGEURL_STEP2_RESP_ERR,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
  THREEDSMETHODURL_STEP1_RESP_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { ecommerceTransaction } from "../transactions/transactionHelper";
import { constantPollingWithPromisePredicateFetch } from "../config/fetch";
import { getUrlParameter } from "../regex/urlUtilities";
import { getConfigOrThrow } from "../config/config";
import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import {
  EcommerceInterruptStatusCodeEnumType,
  EcommerceMaybeInterruptStatusCodeEnumType,
  NpgAuthorizationStatus,
} from "../transactions/TransactionResultUtil";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import {
  TransactionInfo,
  TransactionInfoGatewayInfo,
  TransactionInfoNodeInfo,
} from "../../../generated/definitions/payment-ecommerce-v2/TransactionInfo";
import {
  createClient,
  Client as EcommerceClient,
} from "../../../generated/definitions/payment-ecommerce-v2/client";

/** This function return true when polling on GET transaction must be interrupted */
const interruptTransactionPolling = (
  transactionStaus: TransactionInfo["status"],
  gatewayInfo?: TransactionInfoGatewayInfo,
  nodeInfo?: TransactionInfoNodeInfo
) =>
  pipe(
    EcommerceInterruptStatusCodeEnumType.decode(transactionStaus),
    E.isRight
  ) ||
  nodeInfo?.closePaymentResultError?.statusCode?.toString().startsWith("4") ||
  (pipe(
    EcommerceMaybeInterruptStatusCodeEnumType.decode(transactionStaus),
    E.isRight
  ) &&
    gatewayInfo?.authorizationStatus !== NpgAuthorizationStatus.EXECUTED);

const config = getConfigOrThrow();
/**
 * Polling configuration params
 */
const retries: number = config.CHECKOUT_API_RETRY_NUMBERS;
const delay: number = config.CHECKOUT_API_RETRY_DELAY;
const timeout: Millisecond = config.CHECKOUT_API_TIMEOUT as Millisecond;

const hexToUuid = require("hex-to-uuid");
export const decodeToUUID = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  bytes[6] &= 0x0f;
  bytes[6] |= 0x40;
  bytes[8] &= 0x3f;
  bytes[8] |= 0x80;
  return hexToUuid(bytes.toString("hex")).replace(/-/g, "");
};

const counter = createCounter();
const ecommerceClientWithPolling: EcommerceClient = createClient({
  baseUrl: config.CHECKOUT_PAGOPA_APIM_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      counter.increment();
      if (counter.getValue() === retries) {
        counter.reset();
        return false;
      }
      const { status, gatewayInfo, nodeInfo } = (await r
        .clone()
        .json()) as TransactionInfo;
      return !(
        r.status === 200 &&
        interruptTransactionPolling(status, gatewayInfo, nodeInfo)
      );
    }
  ),
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH_V2,
});

export const callServices = async (
  handleFinalStatusResult: (
    status?: TransactionStatusEnum,
    nodeInfo?: TransactionInfoNodeInfo,
    gatewayInfo?: TransactionInfoGatewayInfo
  ) => void
) => {
  const transaction = pipe(
    getSessionItem(SessionItems.transaction),
    NewTransactionResponse.decode,
    E.fold(
      () => undefined,
      (transaction) => transaction
    )
  );

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

  await pipe(
    TE.fromPredicate(
      (idTransaction) => idTransaction !== "",
      E.toError
    )(getUrlParameter("id")),

    TE.fold(
      (_) => async () => {
        mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
          EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
        });
        return transactionId;
      },
      (idTransaction) => async () => {
        mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value, {
          EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
        });
        return decodeToUUID(idTransaction) as string;
      }
    ),
    T.chain(
      (transactionId) => async () =>
        await pipe(
          ecommerceTransaction(
            transactionId,
            bearerAuth,
            ecommerceClientWithPolling
          ),
          TE.fold(
            () => async () => handleFinalStatusResult(),
            (transactionInfo) => async () => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
              });
              handleFinalStatusResult(
                transactionInfo.status,
                transactionInfo.nodeInfo,
                transactionInfo.gatewayInfo
              );
            }
          )
        )()
    )
  )();
};
