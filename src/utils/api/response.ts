/* eslint-disable functional/immutable-data */
/* eslint-disable no-bitwise */
/* eslint @typescript-eslint/no-var-requires: "off" */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";
import { DeferredPromise } from "@pagopa/ts-commons/lib/promises";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { createCounter } from "../../utils/counter";
import { ecommerceTransactionOutcome } from "../transactions/transactionHelper";
import { exponetialPollingWithPromisePredicateFetch } from "../config/fetch";
import { getUrlParameter } from "../regex/urlUtilities";
import { getConfigOrThrow } from "../config/config";
import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import {
  createClient as createClientV1,
  Client as EcommerceClientV1,
} from "../../../generated/definitions/payment-ecommerce/client";
import { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";

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

const ecommerceClientWithPollingV1: EcommerceClientV1 = createClientV1({
  baseUrl: config.CHECKOUT_PAGOPA_APIM_HOST,
  fetchApi: exponetialPollingWithPromisePredicateFetch(
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
      const { isFinalStatus } = (await r
        .clone()
        .json()) as TransactionOutcomeInfo;
      return !(r.status === 200 && isFinalStatus);
    }
  ),
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH,
});

export const callServices = async (
  handleOutcome: (transactionOutcomeInfo?: TransactionOutcomeInfo) => void
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
      (_) => async () => transactionId,
      (idTransaction) => async () => decodeToUUID(idTransaction) as string
    ),
    T.chain(
      (transactionId) => async () =>
        await pipe(
          ecommerceTransactionOutcome(
            transactionId,
            bearerAuth,
            ecommerceClientWithPollingV1
          ),
          TE.fold(
            () => async () => handleOutcome(),
            (transactionOutcomeInfo) => async () => {
              handleOutcome(transactionOutcomeInfo);
            }
          )
        )()
    )
  )();
};
