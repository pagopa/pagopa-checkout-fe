/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { ErrorsType } from "../../../../utils/errors/checkErrorsModel";
import {
  getSessionItem,
  SessionItems,
} from "../../../../utils/storage/sessionStorage";

const bearerAuth = pipe(
  getSessionItem(SessionItems.transaction) as NewTransactionResponse,
  O.fromNullable,
  O.chain((transaction) => O.fromNullable(transaction.authToken)),
  O.getOrElse(() => "")
);

import { apiWalletEcommerceClient } from "../../../../utils/api/client";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce-v2/NewTransactionResponse";
import { WalletInfo } from "../../../../../generated/definitions/checkout-wallets-v1/WalletInfo";
import { WalletInfoDetails } from "../../../../../generated/definitions/checkout-wallets-v1/WalletInfoDetails";

export const getWalletInstruments = async (
  onError: (e: string) => void,
  onResponse: (data: Array<WalletInfo>) => void
) =>
  pipe(
    TE.tryCatch(
      async () =>
        apiWalletEcommerceClient.getCheckoutPaymentWalletsByIdUser({
          bearerAuth,
        }),
      () => {
        onError(ErrorsType.STATUS_ERROR);
        return E.toError;
      }
    ),
    TE.fold(
      () => async () => {
        onError(ErrorsType.STATUS_ERROR);
        return [] as Array<WalletInfo>;
      },
      (myResExt) => async () =>
        pipe(
          myResExt,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return [] as Array<WalletInfo>;
            },
            (myRes) => {
              switch (myRes.status) {
                case 200:
                  const wallets: Array<WalletInfo> =
                    myRes.value.wallets?.map((w) => ({
                      walletId: w.walletId,
                      paymentMethodId: w.paymentMethodId,
                      status: w.status,
                      creationDate: w.creationDate,
                      updateDate: w.updateDate,
                      applications: Array.from(w.applications ?? []),
                      clients: w.clients,
                      details: w.details,
                      paymentMethodAsset: w.paymentMethodAsset,
                    })) ?? [];
                  onResponse(wallets);
                  return wallets;
                case 401:
                  onError(ErrorsType.UNAUTHORIZED);
                  return [] as Array<WalletInfo>;
                default:
                  onError(ErrorsType.STATUS_ERROR);
                  return [] as Array<WalletInfo>;
              }
            }
          )
        )
    )
  )();

export const isPaypalDetails = (
  details: WalletInfo["details"]
): details is {
  type: string;
  maskedEmail?: string;
  pspId: string;
  pspBusinessName: string;
} => details?.type === "PAYPAL";

/** Type guard: Card */
export const isCardDetails = (
  details: WalletInfoDetails | undefined
): details is {
  type: "CARDS";
  brand: string;
  lastFourDigits: string;
  expiryDate: string;
} => details?.type === "CARDS";
