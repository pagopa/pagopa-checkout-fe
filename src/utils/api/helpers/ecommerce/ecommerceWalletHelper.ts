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
  getSessionItem(SessionItems.authToken) as NewTransactionResponse,
  O.fromNullable,
  O.chain((login) => O.fromNullable(login.authToken)),
  O.getOrElse(() => "")
);

import { apiWalletEcommerceClient } from "../../../../utils/api/client";
import { NewTransactionResponse } from "../../../../../generated/definitions/payment-ecommerce-v2/NewTransactionResponse";
import { WalletInfo } from "../../../../../generated/definitions/checkout-wallets-v1/WalletInfo";
import { WalletInfoDetails } from "../../../../../generated/definitions/checkout-wallets-v1/WalletInfoDetails";
import { evaluateFeatureFlag } from "../checkoutFeatureFlagsHelper";
import featureFlags from "../../../../utils/featureFlags";
import { setSessionItem } from "../../../../utils/storage/sessionStorage";

const evaluateWalletEnabledFF = async (): Promise<boolean> => {
  // eslint-disable-next-line functional/no-let
  let featureFlag = getSessionItem(SessionItems.enableWallet) as string;

  if (featureFlag === null && featureFlag === undefined) {
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

export const getWalletInstruments = async (
  onError: (e: string) => void,
  onResponse: (data: Array<WalletInfo>) => void
) => {
  const isEnabled = await evaluateWalletEnabledFF();
  if (isEnabled) {
    // Feature flag disabled: return an empty array or use a fallback
    onResponse([]);
    return [];
  }
  return pipe(
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
};

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
