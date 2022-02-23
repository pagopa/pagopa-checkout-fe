/* eslint-disable @typescript-eslint/no-empty-function */
import { toError } from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { fromNullable } from "fp-ts/lib/Option";
import {
  fromLeft,
  taskEither,
  TaskEither,
  tryCatch,
} from "fp-ts/lib/TaskEither";
import { Millisecond } from "italia-ts-commons/lib/units";
import { CodiceContestoPagamento } from "../../../generated/definitions/payment-transactions-api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../../generated/definitions/payment-transactions-api/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../../generated/definitions/payment-transactions-api/PaymentActivationsGetResponse";
import { PaymentActivationsPostResponse } from "../../../generated/definitions/payment-transactions-api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../../generated/definitions/payment-transactions-api/PaymentRequestsGetResponse";
import { RptId } from "../../../generated/definitions/payment-transactions-api/RptId";
import { ErrorsType } from "../errors/checkErrorsModel";
import { PaymentCheckData } from "../../features/payment/models/paymentModel";
import { getConfig } from "../config/config";
import {
  mixpanel,
  PAYMENT_ACTIVATE_INIT,
  PAYMENT_ACTIVATE_NET_ERR,
  PAYMENT_ACTIVATE_RESP_ERR,
  PAYMENT_ACTIVATE_SUCCESS,
  PAYMENT_ACTIVATE_SVR_ERR,
  PAYMENT_ACTIVATION_STATUS_INIT,
  PAYMENT_ACTIVATION_STATUS_NET_ERR,
  PAYMENT_ACTIVATION_STATUS_RESP_ERR,
  PAYMENT_ACTIVATION_STATUS_SUCCESS,
  PAYMENT_ACTIVATION_STATUS_SVR_ERR,
  PAYMENT_VERIFY_INIT,
  PAYMENT_VERIFY_NET_ERR,
  PAYMENT_VERIFY_RESP_ERR,
  PAYMENT_VERIFY_SUCCESS,
  PAYMENT_VERIFY_SVR_ERR,
} from "../config/mixpanelHelperInit";
import {
  PAYMENT_CHECK_INIT,
  PAYMENT_CHECK_NET_ERR,
  PAYMENT_CHECK_RESP_ERR,
  PAYMENT_CHECK_SUCCESS,
  PAYMENT_CHECK_SVR_ERR,
  PAYMENT_PSPLIST_INIT,
  PAYMENT_PSPLIST_NET_ERR,
  PAYMENT_PSPLIST_RESP_ERR,
  PAYMENT_PSPLIST_SUCCESS,
  PAYMENT_PSPLIST_SVR_ERR,
} from "../config/pmMixpanelHelperInit";
import { PaymentSession } from "../sessionData/PaymentSession";
import { apiClient, pmClient } from "./client";

export const getPaymentInfoTask = (
  rptId: RptId,
  recaptchaResponse: string
): TaskEither<string, PaymentRequestsGetResponse> =>
  tryCatch(
    () => {
      mixpanel.track(PAYMENT_VERIFY_INIT.value, {
        EVENT_ID: PAYMENT_VERIFY_INIT.value,
      });
      return apiClient.getPaymentInfo({
        rptId,
        recaptchaResponse,
      });
    },
    () => {
      mixpanel.track(PAYMENT_VERIFY_NET_ERR.value, {
        EVENT_ID: PAYMENT_VERIFY_NET_ERR.value,
      });
      return "Errore recupero pagamento";
    }
  ).foldTaskEither(
    (err) => {
      mixpanel.track(PAYMENT_VERIFY_SVR_ERR.value, {
        EVENT_ID: PAYMENT_VERIFY_SVR_ERR.value,
      });
      return fromLeft(err);
    },
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft("Errore recupero pagamento"),
        (responseType) => {
          const reason =
            responseType.status === 200 ? "" : responseType.value?.detail;
          const EVENT_ID: string =
            responseType.status === 200
              ? PAYMENT_VERIFY_SUCCESS.value
              : PAYMENT_VERIFY_RESP_ERR.value;
          mixpanel.track(EVENT_ID, { EVENT_ID, reason });
          return responseType.status !== 200
            ? fromLeft(
                fromNullable(responseType.value?.detail).getOrElse(
                  "Errore recupero pagamento"
                )
              )
            : taskEither.of(responseType.value);
        }
      )
  );

export const activePaymentTask = (
  amountSinglePayment: ImportoEuroCents,
  paymentContextCode: CodiceContestoPagamento,
  rptId: RptId
): TaskEither<string, PaymentActivationsPostResponse> =>
  tryCatch(
    () => {
      mixpanel.track(PAYMENT_ACTIVATE_INIT.value, {
        EVENT_ID: PAYMENT_ACTIVATE_INIT.value,
      });
      return apiClient.activatePayment({
        body: {
          rptId,
          importoSingoloVersamento: amountSinglePayment,
          codiceContestoPagamento: paymentContextCode,
        },
      });
    },
    () => {
      mixpanel.track(PAYMENT_ACTIVATE_NET_ERR.value, {
        EVENT_ID: PAYMENT_ACTIVATE_NET_ERR.value,
      });
      return "Errore attivazione pagamento";
    }
  ).foldTaskEither(
    (err) => {
      mixpanel.track(PAYMENT_ACTIVATE_SVR_ERR.value, {
        EVENT_ID: PAYMENT_ACTIVATE_SVR_ERR.value,
      });
      return fromLeft(err);
    },
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft("Errore attivazione pagamento"),
        (responseType) => {
          const reason =
            responseType.status === 200 ? "" : responseType.value?.detail;
          const EVENT_ID: string =
            responseType.status === 200
              ? PAYMENT_ACTIVATE_SUCCESS.value
              : PAYMENT_ACTIVATE_RESP_ERR.value;
          mixpanel.track(EVENT_ID, { EVENT_ID, reason });

          return responseType.status !== 200
            ? fromLeft(
                fromNullable(responseType.value?.detail).getOrElse(
                  `Errore attivazione pagamento : ${responseType.status}`
                )
              )
            : taskEither.of(responseType.value);
        }
      )
  );

export const getActivationStatusTask = (
  paymentContextCode: CodiceContestoPagamento
): TaskEither<string, PaymentActivationsGetResponse> =>
  tryCatch(
    () => {
      mixpanel.track(PAYMENT_ACTIVATION_STATUS_INIT.value, {
        EVENT_ID: PAYMENT_ACTIVATION_STATUS_INIT.value,
      });
      return apiClient.getActivationStatus({
        codiceContestoPagamento: paymentContextCode,
      });
    },
    () => {
      mixpanel.track(PAYMENT_ACTIVATION_STATUS_NET_ERR.value, {
        EVENT_ID: PAYMENT_ACTIVATION_STATUS_NET_ERR.value,
      });
      return "Errore stato pagamento";
    }
  ).foldTaskEither(
    (err) => {
      mixpanel.track(PAYMENT_ACTIVATION_STATUS_SVR_ERR.value, {
        EVENT_ID: PAYMENT_ACTIVATION_STATUS_SVR_ERR.value,
      });
      return fromLeft(err);
    },
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft("Errore stato pagamento"),
        (responseType) => {
          const EVENT_ID: string =
            responseType.status === 200
              ? PAYMENT_ACTIVATION_STATUS_SUCCESS.value
              : PAYMENT_ACTIVATION_STATUS_RESP_ERR.value;
          mixpanel.track(EVENT_ID, { EVENT_ID });

          return responseType.status !== 200
            ? fromLeft(`Errore stato pagamento : ${responseType.status}`)
            : taskEither.of(responseType.value);
        }
      )
  );
export const pollingActivationStatus = async (
  paymentNoticeCode: CodiceContestoPagamento,
  attempts: number,
  onResponse: (activationResponse: { idPagamento: any }) => void
): Promise<void> => {
  await getActivationStatusTask(paymentNoticeCode)
    .fold(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      attempts > 0
        ? setTimeout(
            pollingActivationStatus,
            getConfig("IO_PAY_PORTAL_PAY_WL_POLLING_INTERVAL") as Millisecond,
            paymentNoticeCode,
            --attempts, // eslint-disable-line no-param-reassign,
            onResponse
          )
        : () => {}; // TODO Error Intereptor
    }, onResponse)
    .run();
};

export const getPaymentCheckData = async ({
  idPayment,
  onError,
  onResponse,
  onNavigate,
}: {
  idPayment: string;
  onError: (e: string) => void;
  onResponse: (r: PaymentCheckData) => void;
  onNavigate: () => void;
}) => {
  mixpanel.track(PAYMENT_CHECK_INIT.value, {
    EVENT_ID: PAYMENT_CHECK_INIT.value,
  });
  fromNullable(idPayment).fold(
    // If undefined
    await tryCatch(
      () =>
        pmClient.checkPaymentUsingGET({
          id: fromNullable(idPayment).getOrElse(""),
        }),
      // Error on call
      () => {
        onError(ErrorsType.CONNECTION);
        mixpanel.track(PAYMENT_CHECK_NET_ERR.value, {
          EVENT_ID: PAYMENT_CHECK_NET_ERR.value,
        });
        return toError;
      }
    )
      .fold(
        () => {
          onError(ErrorsType.SERVER);
          mixpanel.track(PAYMENT_CHECK_SVR_ERR.value, {
            EVENT_ID: PAYMENT_CHECK_SVR_ERR.value,
          });
        },
        (myResExt: any) => {
          myResExt.fold(
            onError(ErrorsType.GENERIC_ERROR),
            (response: {
              value: { data: { urlRedirectEc: string } };
              status: number;
            }) => {
              const maybePayment = PaymentSession.decode(response.value?.data);

              if (response.status === 200 && maybePayment.isRight()) {
                sessionStorage.setItem(
                  "checkData",
                  JSON.stringify(maybePayment.value)
                );
                onResponse(maybePayment.value as PaymentCheckData);
                mixpanel.track(PAYMENT_CHECK_SUCCESS.value, {
                  EVENT_ID: PAYMENT_CHECK_SUCCESS.value,
                });
                const originInput = fromNullable(origin).getOrElse(
                  response.value.data.urlRedirectEc
                );
                sessionStorage.setItem(
                  "originUrlRedirect",
                  originInput === "payportal" ? "/" : originInput
                );
              } else {
                onNavigate();
                mixpanel.track(PAYMENT_CHECK_RESP_ERR.value, {
                  EVENT_ID: PAYMENT_CHECK_RESP_ERR.value,
                });
              }
            }
          );
        }
      )
      .run(),
    () => undefined
  );
};

export const getPaymentPSPList = async ({
  onError,
  onResponse,
}: {
  onError: (e: string) => void;
  onResponse: (
    r: Array<{
      name: string | undefined;
      label: string | undefined;
      image: string | undefined;
      commission: number;
      idPsp: number | undefined;
    }>
  ) => void;
}) => {
  const walletStored = sessionStorage.getItem("wallet") || "";
  const checkDataStored = sessionStorage.getItem("checkData") || "";
  const sessionToken = sessionStorage.getItem("sessionToken") || "";

  const checkData = JSON.parse(checkDataStored);
  const wallet = JSON.parse(walletStored);

  const idPayment = checkData.idPayment;
  const Bearer = `Bearer ${sessionToken}`;
  const paymentType = wallet.type;
  const isList = true;
  const language = "it";
  const idWallet = wallet.idWallet;

  mixpanel.track(PAYMENT_PSPLIST_INIT.value, {
    EVENT_ID: PAYMENT_PSPLIST_INIT.value,
  });
  const pspL = await TE.tryCatch(
    () =>
      pmClient.getPspListUsingGET({
        Bearer,
        paymentType,
        isList,
        idWallet,
        language,
        idPayment,
      }),
    (_e) => {
      onError(ErrorsType.CONNECTION);
      mixpanel.track(PAYMENT_PSPLIST_NET_ERR.value, {
        EVENT_ID: PAYMENT_PSPLIST_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_PSPLIST_SVR_ERR.value, {
          EVENT_ID: PAYMENT_PSPLIST_SVR_ERR.value,
        });
        return undefined;
      },
      (myResExt) =>
        myResExt.fold(
          () => [],
          (myRes) => {
            if (myRes?.status === 200) {
              mixpanel.track(PAYMENT_PSPLIST_SUCCESS.value, {
                EVENT_ID: PAYMENT_PSPLIST_SUCCESS.value,
              });
              return myRes?.value?.data?.pspList;
            } else {
              onError(ErrorsType.GENERIC_ERROR);
              mixpanel.track(PAYMENT_PSPLIST_RESP_ERR.value, {
                EVENT_ID: PAYMENT_PSPLIST_RESP_ERR.value,
              });
              return [];
            }
          }
        )
    )
    .run();

  const psp = pspL?.map((e) => ({
    name: e?.businessName,
    label: e?.businessName,
    image: e?.logoPSP,
    commission:
      e?.fixedCost?.amount && e?.fixedCost?.decimalDigits
        ? e?.fixedCost?.amount / Math.pow(10, e?.fixedCost?.decimalDigits)
        : 0,
    idPsp: e?.id,
  }));

  onResponse(psp || []);
};
