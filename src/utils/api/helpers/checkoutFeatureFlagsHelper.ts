import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { apiCheckoutFeatureFlags } from "../client";

export const evaluateFeatureFlag = async (
  featureKey: string,
  onError: (e: string) => void,
  onResponse: (data: { enabled: boolean }) => void
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
              const target: any = res.value?.[featureKey] ?? false;
              onResponse({ enabled: target });
              return { enabled: target };
            }
          )
        )
    )
  )();
};

export const evaluateFeatureFlagsAll = async () =>
  await pipe(
    TE.tryCatch(
      () => apiCheckoutFeatureFlags.evaluateFeatureFlags({}),
      () => new Error("Network error")
    ),
    TE.fold(
      () => async () => {
        throw new Error("Server error");
      },
      (response) => async () =>
        pipe(
          response,
          E.fold(
            () => {
              throw new Error("Response error");
            },
            (res: any) => res.value ?? {}
          )
        )
    )
  )();
