/* eslint-disable functional/immutable-data */
/* eslint-disable no-bitwise */
/* eslint @typescript-eslint/no-var-requires: "off" */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
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
import {
  createClient,
  Client as EcommerceClient,
} from "../../../generated/definitions/payment-ecommerce/client";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce/TransactionInfo";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { EcommerceFinalStatusCodeEnumType } from "../transactions/TransactionResultUtil";
import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import { Transaction } from "../../features/payment/models/paymentModel";
const config = getConfigOrThrow();
/**
 * Polling configuration params
 */
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = config.CHECKOUT_API_TIMEOUT as Millisecond;

const hexToUuid = require("hex-to-uuid");
const decodeToUUID = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  bytes[6] &= 0x0f;
  bytes[6] |= 0x40;
  bytes[8] &= 0x3f;
  bytes[8] |= 0x80;
  return hexToUuid(bytes.toString("hex"));
};

const ecommerceClientWithPolling: EcommerceClient = createClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const myJson = (await r.clone().json()) as TransactionInfo;
      return (
        r.status === 200 &&
        !pipe(EcommerceFinalStatusCodeEnumType.decode(myJson.status), E.isRight)
      );
    }
  ),
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH,
});

export const callServices = async (
  handleFinalStatusResult: (idStatus?: TransactionStatusEnum) => void
) => {
  await pipe(
    TE.fromPredicate(
      (idTransaction) => idTransaction !== "",
      E.toError
    )(getUrlParameter("id")),
    TE.fold(
      (_) => async () => {
        const transactionId =
          (getSessionItem(SessionItems.transaction) as Transaction | undefined)
            ?.transactionId || "";
        await pipe(
          ecommerceTransaction(transactionId, ecommerceClientWithPolling),
          TE.fold(
            // eslint-disable-next-line sonarjs/no-identical-functions
            () => async () => {
              mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
                EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
              });
              handleFinalStatusResult();
            },
            // eslint-disable-next-line sonarjs/no-identical-functions
            (transactionInfo) => async () => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
              });
              handleFinalStatusResult(transactionInfo.status);
            }
          )
        )();
      },
      (idTransaction) => async () =>
        await pipe(
          ecommerceTransaction(
            decodeToUUID(idTransaction),
            ecommerceClientWithPolling
          ),
          TE.fold(
            (_) => async () => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
              });
              handleFinalStatusResult();
            },
            // eslint-disable-next-line sonarjs/no-identical-functions
            (transactionInfo) => async () => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
              });
              handleFinalStatusResult(transactionInfo.status);
            }
          )
        )()
    )
  )();
};
