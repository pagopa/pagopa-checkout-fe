import * as E from "fp-ts/Either";
import { constVoid, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import ReCAPTCHA from "react-google-recaptcha";
import { ErrorsType } from "../../../utils/errors/checkErrorsModel";
import {
  getRptIdsFromSession,
  getSessionItem,
  SessionItems,
} from "../../../utils/storage/sessionStorage";
import {
  apiCheckoutAuthServiceClientAuthTokenV1,
  apiCheckoutAuthServiceClientV1,
  apiCheckoutAuthServiceWithRetryV1,
} from "../client";
import { UserInfoResponse } from "../../../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { AuthRequest } from "../../../../generated/definitions/checkout-auth-service-v1/AuthRequest";
import { mixpanel } from "../../mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
} from "../../mixpanel/mixpanelEvents";
import { callRecaptcha } from "./recaptchaHelper";

export const proceedToLogin = async ({
  recaptchaRef,
  onError,
  onResponse,
}: {
  recaptchaRef: ReCAPTCHA;
  onError: (e: string) => void;
  onResponse: (r: any) => void;
}) => {
  const token = await callRecaptcha(recaptchaRef, true);
  await pipe(
    O.fromNullable(token),
    TE.fromOption(() => {
      onError(ErrorsType.GENERIC_ERROR);
      return E.toError;
    }),
    TE.chain((token) =>
      TE.tryCatch(
        () =>
          apiCheckoutAuthServiceClientV1.authLogin({
            recaptcha: token,
            "x-rpt-ids": getRptIdsFromSession(),
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
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return {};
            },
            (myRes) => {
              if (myRes?.status === 200) {
                onResponse(myRes?.value.urlRedirect);
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

export const authentication = async ({
  authCode,
  state,
  onResponse,
  onError,
}: {
  authCode: string | null;
  state: string | null;
  onResponse: (e: string) => void;
  onError: (e: string) => void;
}) => {
  await pipe(
    { authCode, state },
    AuthRequest.decode,
    E.mapLeft(() => ErrorsType.GENERIC_ERROR),
    TE.fromEither,
    TE.chain((decodedRequest) =>
      TE.tryCatch(
        () =>
          apiCheckoutAuthServiceClientAuthTokenV1.authenticateWithAuthToken({
            body: decodedRequest,
            "x-rpt-ids": getRptIdsFromSession(),
          }),
        () => ErrorsType.GENERIC_ERROR
      )
    ),
    TE.fold(
      (error) => {
        onError(error);
        return TE.left(error);
      },
      (response) =>
        pipe(
          response,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return TE.left(ErrorsType.GENERIC_ERROR);
            },
            (res) => {
              if (res.status === 200) {
                onResponse(res.value.authToken);
                mixpanel.track(MixpanelEventsId.CHK_LOGIN_SUCCESS, {
                  EVENT_ID: MixpanelEventsId.CHK_LOGIN_SUCCESS,
                  EVENT_CATEGORY: MixpanelEventCategory.TECH,
                  page: window.location.pathname,
                });
                return TE.right({});
              } else {
                onError(ErrorsType.CONNECTION);
                return TE.left(ErrorsType.CONNECTION);
              }
            }
          )
        )
    )
  )();
};

export const checkLogout = (onLogoutCallBack: typeof constVoid) =>
  pipe(
    getSessionItem(SessionItems.authToken),
    O.fromNullable,
    TE.fromOption(constVoid),
    TE.chain(() =>
      TE.fromTask(async () => {
        await logoutUser({
          onError: onLogoutCallBack,
          onResponse: onLogoutCallBack,
        });
      })
    )
  )();

export const logoutUser = async ({
  onResponse,
  onError,
}: {
  onResponse: () => void;
  onError: (e: string) => void;
}) => {
  await pipe(
    getSessionItem(SessionItems.authToken) as string,
    O.fromNullable,
    TE.fromOption(() => ErrorsType.GENERIC_ERROR),
    TE.chain((authToken) =>
      TE.tryCatch(
        () =>
          apiCheckoutAuthServiceWithRetryV1.authLogout({
            bearerAuth: authToken,
            "x-rpt-ids": getRptIdsFromSession(),
          }),
        () => ErrorsType.GENERIC_ERROR
      )
    ),
    TE.fold(
      (error) => {
        onError(error);
        return TE.left(error);
      },
      (response) =>
        pipe(
          response,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return TE.left(ErrorsType.GENERIC_ERROR);
            },
            (res) => {
              if (res.status === 204) {
                onResponse();
                return TE.right(res.value);
              } else {
                onError(ErrorsType.CONNECTION);
                return TE.left(ErrorsType.CONNECTION);
              }
            }
          )
        )
    )
  )();
};

export const retrieveUserInfo = async ({
  onResponse,
  onError,
}: {
  onResponse: (e: UserInfoResponse) => void;
  onError: (e: string) => void;
}) => {
  await pipe(
    getSessionItem(SessionItems.authToken) as string,
    O.fromNullable,
    TE.fromOption(() => ErrorsType.GENERIC_ERROR),
    TE.chain((authToken) =>
      TE.tryCatch(
        () =>
          apiCheckoutAuthServiceWithRetryV1.authUsers({
            bearerAuth: authToken,
            "x-rpt-ids": getRptIdsFromSession(),
          }),
        () => ErrorsType.GENERIC_ERROR
      )
    ),
    TE.fold(
      (error) => {
        onError(error);
        return TE.left(error);
      },
      (response) =>
        pipe(
          response,
          E.fold(
            () => {
              onError(ErrorsType.GENERIC_ERROR);
              return TE.left(ErrorsType.GENERIC_ERROR);
            },
            (res) => {
              if (res.status === 200) {
                onResponse(res.value);
                return TE.right(res.value);
              } else {
                onError(ErrorsType.CONNECTION);
                return TE.left(ErrorsType.CONNECTION);
              }
            }
          )
        )
    )
  )();
};
