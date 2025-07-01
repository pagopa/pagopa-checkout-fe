import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { apiCheckoutFeatureFlags } from "../client";

export const evaluateFeatureFlag = async (
  featureKeys: string[],
  onError: (e: string) => void,
  onResponse: (featureKey: string, data: { enabled: boolean }) => void
) => {
  await pipe(
    TE.tryCatch(
      () => apiCheckoutFeatureFlags.evaluateFeatureFlags({}),
      () => {
        onError("Network error");
        return new Error("Network error");
      }
    ),
    TE.fold(
      () => async () => {
        onError("Server error");
        return {};
      },
      (response) => async () =>
        pipe(
          response,
          E.fold(
            () => {
              onError("Response error");
              return {};
            },
            (res: any) => {
              featureKeys.forEach(featureKey => {
                 const target: any = res.value?.[featureKey] ?? false;
                 onResponse(featureKey, { enabled: target });
              })
              return {};
            }
          )
        )
    )
  )();
};

