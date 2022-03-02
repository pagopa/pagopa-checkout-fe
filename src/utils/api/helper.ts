/* eslint-disable @typescript-eslint/no-empty-function */
import { toError } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import {
  fromLeft,
  taskEither,
  TaskEither,
  tryCatch,
} from "fp-ts/lib/TaskEither";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  TypeEnum,
  Wallet,
} from "../../../generated/definitions/payment-manager-api/Wallet";
import { CodiceContestoPagamento } from "../../../generated/definitions/payment-transactions-api/CodiceContestoPagamento";
import { ImportoEuroCents } from "../../../generated/definitions/payment-transactions-api/ImportoEuroCents";
import { PaymentActivationsGetResponse } from "../../../generated/definitions/payment-transactions-api/PaymentActivationsGetResponse";
import { PaymentActivationsPostResponse } from "../../../generated/definitions/payment-transactions-api/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../../generated/definitions/payment-transactions-api/PaymentRequestsGetResponse";
import { RptId } from "../../../generated/definitions/payment-transactions-api/RptId";
import {
  InputCardFormFields,
  PaymentCheckData,
  Wallet as PaymentWallet,
} from "../../features/payment/models/paymentModel";
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
  PAYMENT_ACTION_DELETE_INIT,
  PAYMENT_ACTION_DELETE_NET_ERR,
  PAYMENT_ACTION_DELETE_RESP_ERR,
  PAYMENT_ACTION_DELETE_SUCCESS,
  PAYMENT_ACTION_DELETE_SVR_ERR,
  PAYMENT_APPROVE_TERMS_INIT,
  PAYMENT_APPROVE_TERMS_NET_ERR,
  PAYMENT_APPROVE_TERMS_RESP_ERR,
  PAYMENT_APPROVE_TERMS_SUCCESS,
  PAYMENT_APPROVE_TERMS_SVR_ERR,
  PAYMENT_CHECK_INIT,
  PAYMENT_CHECK_NET_ERR,
  PAYMENT_CHECK_RESP_ERR,
  PAYMENT_CHECK_SUCCESS,
  PAYMENT_CHECK_SVR_ERR,
  PAYMENT_PAY3DS2_INIT,
  PAYMENT_PAY3DS2_NET_ERR,
  PAYMENT_PAY3DS2_RESP_ERR,
  PAYMENT_PAY3DS2_SUCCESS,
  PAYMENT_PAY3DS2_SVR_ERR,
  PAYMENT_PSPLIST_INIT,
  PAYMENT_PSPLIST_NET_ERR,
  PAYMENT_PSPLIST_RESP_ERR,
  PAYMENT_PSPLIST_SUCCESS,
  PAYMENT_PSPLIST_SVR_ERR,
  PAYMENT_START_SESSION_INIT,
  PAYMENT_START_SESSION_NET_ERR,
  PAYMENT_START_SESSION_RESP_ERR,
  PAYMENT_START_SESSION_SUCCESS,
  PAYMENT_START_SESSION_SVR_ERR,
  PAYMENT_UPD_WALLET_INIT,
  PAYMENT_UPD_WALLET_NET_ERR,
  PAYMENT_UPD_WALLET_RESP_ERR,
  PAYMENT_UPD_WALLET_SUCCESS,
  PAYMENT_UPD_WALLET_SVR_ERR,
  PAYMENT_WALLET_INIT,
  PAYMENT_WALLET_NET_ERR,
  PAYMENT_WALLET_RESP_ERR,
  PAYMENT_WALLET_SUCCESS,
  PAYMENT_WALLET_SVR_ERR,
} from "../config/pmMixpanelHelperInit";
import { ErrorsType } from "../errors/checkErrorsModel";
import { PaymentSession } from "../sessionData/PaymentSession";
import { WalletSession } from "../sessionData/WalletSession";
import { getBrowserInfoTask, getEMVCompliantColorDepth } from "./checkHelper";
import { apiClient, iopayportalClient, pmClient } from "./client";

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
  rptId: RptId,
  recaptchaResponse: string
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

export const getSessionWallet = async (
  creditCard: InputCardFormFields,
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const useremail: string = sessionStorage.getItem("useremail") || "";
  const checkDataStored: string = sessionStorage.getItem("checkData") || "";
  const checkData = JSON.parse(checkDataStored);

  mixpanel.track(PAYMENT_START_SESSION_INIT.value, {
    EVENT_ID: PAYMENT_START_SESSION_INIT.value,
  });
  // 1. Start Session to Fetch session token
  const mySessionToken = await TE.tryCatch(
    () =>
      pmClient.startSessionUsingPOST({
        startSessionRequest: {
          data: {
            email: fromNullable(useremail).getOrElse(""),
            idPayment: fromNullable(checkData.idPayment).getOrElse(""),
            fiscalCode: fromNullable(checkData.fiscalCode).getOrElse(""),
          },
        },
      }),
    (_e) => {
      onError(ErrorsType.CONNECTION);
      mixpanel.track(PAYMENT_START_SESSION_NET_ERR.value, {
        EVENT_ID: PAYMENT_START_SESSION_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_START_SESSION_SVR_ERR.value, {
          EVENT_ID: PAYMENT_START_SESSION_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => {
        const sessionToken = myResExt.fold(
          () => "fakeSessionToken",
          (myRes) => {
            if (myRes.status === 200) {
              mixpanel.track(PAYMENT_START_SESSION_SUCCESS.value, {
                EVENT_ID: PAYMENT_START_SESSION_SUCCESS.value,
              });
            } else {
              onError(ErrorsType.GENERIC_ERROR);
              mixpanel.track(PAYMENT_START_SESSION_RESP_ERR.value, {
                EVENT_ID: PAYMENT_START_SESSION_RESP_ERR.value,
              });
            }
            return myRes.status === 200
              ? fromNullable(myRes.value.sessionToken).getOrElse(
                  "fakeSessionToken"
                )
              : "fakeSessionToken";
          }
        );
        sessionStorage.setItem("sessionToken", sessionToken);
        return sessionToken;
      }
    )
    .run();

  mixpanel.track(PAYMENT_APPROVE_TERMS_INIT.value, {
    EVENT_ID: PAYMENT_APPROVE_TERMS_INIT.value,
  });
  // 2. Approve Terms
  await TE.tryCatch(
    () =>
      pmClient.approveTermsUsingPOST({
        Bearer: `Bearer ${mySessionToken}`,
        approveTermsRequest: {
          data: {
            terms: true,
            privacy: true,
          },
        },
      }),
    (_e) => {
      onError(ErrorsType.CONNECTION);
      mixpanel.track(PAYMENT_APPROVE_TERMS_NET_ERR.value, {
        EVENT_ID: PAYMENT_APPROVE_TERMS_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_APPROVE_TERMS_SVR_ERR.value, {
          EVENT_ID: PAYMENT_APPROVE_TERMS_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => {
        myResExt.fold(
          () => "noApproval",
          (myRes) => {
            if (myRes.status === 200) {
              mixpanel.track(PAYMENT_APPROVE_TERMS_SUCCESS.value, {
                EVENT_ID: PAYMENT_APPROVE_TERMS_SUCCESS.value,
              });
            } else {
              onError(ErrorsType.GENERIC_ERROR);
              mixpanel.track(PAYMENT_APPROVE_TERMS_RESP_ERR.value, {
                EVENT_ID: PAYMENT_APPROVE_TERMS_RESP_ERR.value,
              });
            }
            return myRes.status === 200
              ? JSON.stringify(myRes.value.data)
              : "noApproval";
          }
        );
      }
    )
    .run();

  mixpanel.track(PAYMENT_WALLET_INIT.value, {
    EVENT_ID: PAYMENT_WALLET_INIT.value,
  });
  // 3. Wallet
  await TE.tryCatch(
    () =>
      pmClient.addWalletUsingPOST({
        Bearer: `Bearer ${mySessionToken}`,
        walletRequest: {
          data: {
            type: TypeEnum.CREDIT_CARD,
            creditCard: {
              expireMonth: creditCard.expirationDate.split("/")[0],
              expireYear: creditCard.expirationDate.split("/")[1],
              holder: creditCard.name.trim(),
              pan: creditCard.number.trim(),
              securityCode: creditCard.cvv,
            },
            idPagamentoFromEC: checkData.idPayment, // needs to exist
          },
        },
        language: "it",
      }),
    (_e) => {
      onError(ErrorsType.CONNECTION);
      mixpanel.track(PAYMENT_WALLET_NET_ERR.value, {
        EVENT_ID: PAYMENT_WALLET_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_WALLET_SVR_ERR.value, {
          EVENT_ID: PAYMENT_WALLET_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => {
        const walletResp = myResExt.fold(
          () => {
            onError(ErrorsType.GENERIC_ERROR);
            mixpanel.track(PAYMENT_WALLET_RESP_ERR.value, {
              EVENT_ID: PAYMENT_WALLET_RESP_ERR.value,
            });
          },
          (myRes) => {
            if (myRes.status === 200) {
              mixpanel.track(PAYMENT_WALLET_SUCCESS.value, {
                EVENT_ID: PAYMENT_WALLET_SUCCESS.value,
              });
            } else {
              onError(ErrorsType.INVALID_CARD);
              mixpanel.track(PAYMENT_WALLET_RESP_ERR.value, {
                EVENT_ID: PAYMENT_WALLET_RESP_ERR.value,
              });
            }
            return myRes.status === 200
              ? JSON.stringify(myRes.value.data)
              : "fakeWallet";
          }
        );

        sessionStorage.setItem("securityCode", creditCard.cvv);
        WalletSession.decode(JSON.parse(walletResp as any as string)).map(
          (wallet) => {
            sessionStorage.setItem("wallet", JSON.stringify(wallet));
          }
        );
        onResponse();
      }
    )
    .run();
};

export const updateWallet = async (
  idPsp: number,
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const walletStored = sessionStorage.getItem("wallet") || "";
  const sessionToken = sessionStorage.getItem("sessionToken") || "";

  const wallet = JSON.parse(walletStored);

  const Bearer = `Bearer ${sessionToken}`;
  const idWallet = wallet.idWallet;

  mixpanel.track(PAYMENT_UPD_WALLET_INIT.value, {
    EVENT_ID: PAYMENT_UPD_WALLET_INIT.value,
  });
  await TE.tryCatch(
    () =>
      pmClient.updateWalletUsingPUT({
        Bearer,
        id: idWallet,
        walletRequest: {
          data: {
            idPsp,
          },
        },
      }),
    (_e) => {
      onError(ErrorsType.GENERIC_ERROR);
      mixpanel.track(PAYMENT_UPD_WALLET_NET_ERR.value, {
        EVENT_ID: PAYMENT_UPD_WALLET_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.GENERIC_ERROR);
        mixpanel.track(PAYMENT_UPD_WALLET_SVR_ERR.value, {
          EVENT_ID: PAYMENT_UPD_WALLET_SVR_ERR.value,
        });
      },
      (myResExt) =>
        myResExt.fold(
          () =>
            mixpanel.track(PAYMENT_UPD_WALLET_RESP_ERR.value, {
              EVENT_ID: PAYMENT_UPD_WALLET_RESP_ERR.value,
            }),
          (res) => {
            WalletSession.decode(res.value?.data).fold(
              (_) => undefined,
              (wallet) => {
                mixpanel.track(PAYMENT_UPD_WALLET_SUCCESS.value, {
                  EVENT_ID: PAYMENT_UPD_WALLET_SUCCESS.value,
                });
                sessionStorage.setItem("wallet", JSON.stringify(wallet));
                onResponse();
              }
            );
          }
        )
    )
    .run();
};

export const confirmPayment = async (
  {
    checkData,
    wallet,
  }: {
    checkData: PaymentCheckData;
    wallet: PaymentWallet;
  },
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const browserInfo = (
    await getBrowserInfoTask(iopayportalClient).run()
  ).getOrElse({
    ip: "",
    useragent: "",
    accept: "",
  });

  const threeDSData = {
    browserJavaEnabled: navigator.javaEnabled().toString(),
    browserLanguage: navigator.language,
    browserColorDepth: getEMVCompliantColorDepth(screen.colorDepth).toString(),
    browserScreenHeight: screen.height.toString(),
    browserScreenWidth: screen.width.toString(),
    browserTZ: new Date().getTimezoneOffset().toString(),
    browserAcceptHeader: browserInfo.accept,
    browserIP: browserInfo.ip,
    browserUserAgent: navigator.userAgent,
    acctID: `ACCT_${(
      JSON.parse(
        fromNullable(sessionStorage.getItem("wallet")).getOrElse("")
      ) as Wallet
    ).idWallet
      ?.toString()
      .trim()}`,
    deliveryEmailAddress: fromNullable(
      sessionStorage.getItem("useremail")
    ).getOrElse(""),
    mobilePhone: null,
  };

  mixpanel.track(PAYMENT_PAY3DS2_INIT.value, {
    EVENT_ID: PAYMENT_PAY3DS2_INIT.value,
  });
  // Pay
  await TE.tryCatch(
    () =>
      pmClient.pay3ds2UsingPOST({
        Bearer: `Bearer ${sessionStorage.getItem("sessionToken")}`,
        id: checkData.idPayment,
        payRequest: {
          data: {
            tipo: "web",
            idWallet: wallet.idWallet,
            cvv: fromNullable(sessionStorage.getItem("securityCode")).getOrElse(
              ""
            ),
            threeDSData: JSON.stringify(threeDSData),
          },
        },
        language: "it",
      }),
    (_e) => {
      onError(ErrorsType.CONNECTION);
      mixpanel.track(PAYMENT_PAY3DS2_NET_ERR.value, {
        EVENT_ID: PAYMENT_PAY3DS2_NET_ERR.value,
      });
      return toError;
    }
  )
    .fold(
      (_r) => {
        onError(ErrorsType.SERVER);
        mixpanel.track(PAYMENT_PAY3DS2_SVR_ERR.value, {
          EVENT_ID: PAYMENT_PAY3DS2_SVR_ERR.value,
        });
      }, // to be replaced with logic to handle failures
      (myResExt) => {
        const paymentResp = myResExt.fold(
          () => "fakePayment",
          (myRes) => {
            if (myRes.status === 200) {
              mixpanel.track(PAYMENT_PAY3DS2_SUCCESS.value, {
                EVENT_ID: PAYMENT_PAY3DS2_SUCCESS.value,
              });
              return JSON.stringify(myRes.value.data);
            } else {
              onError(ErrorsType.GENERIC_ERROR);
              mixpanel.track(PAYMENT_PAY3DS2_RESP_ERR.value, {
                EVENT_ID: PAYMENT_PAY3DS2_RESP_ERR.value,
              });
              return "fakePayment";
            }
          }
        );
        sessionStorage.setItem("idTransaction", JSON.parse(paymentResp).token);
        onResponse();
      }
    )
    .run();
};

export const cancelPayment = async (
  onError: (e: string) => void,
  onResponse: () => void
) => {
  const checkData = JSON.parse(sessionStorage.getItem("checkData") || "");

  // Payment action DELETE
  mixpanel.track(PAYMENT_ACTION_DELETE_INIT.value, {
    EVENT_ID: PAYMENT_ACTION_DELETE_INIT.value,
  });

  const eventResult:
    | PAYMENT_ACTION_DELETE_NET_ERR
    | PAYMENT_ACTION_DELETE_SVR_ERR
    | PAYMENT_ACTION_DELETE_RESP_ERR
    | PAYMENT_ACTION_DELETE_SUCCESS = await TE.tryCatch(
    () =>
      pmClient.deleteBySessionCookieExpiredUsingDELETE({
        Bearer: `Bearer ${sessionStorage.getItem("sessionToken")}`,
        id: checkData.idPayment,
        koReason: "ANNUTE",
        showWallet: false,
      }),
    () => PAYMENT_ACTION_DELETE_NET_ERR.value
  )
    .fold(
      () => PAYMENT_ACTION_DELETE_SVR_ERR.value,
      (myResExt) =>
        myResExt.fold(
          () => PAYMENT_ACTION_DELETE_RESP_ERR.value,
          (myRes) =>
            myRes.status === 200
              ? PAYMENT_ACTION_DELETE_SUCCESS.value
              : PAYMENT_ACTION_DELETE_RESP_ERR.value
        )
    )
    .run();

  mixpanel.track(eventResult, { EVENT_ID: eventResult });

  if (PAYMENT_ACTION_DELETE_SUCCESS.decode(eventResult).isRight()) {
    onResponse();
  } else if (PAYMENT_ACTION_DELETE_NET_ERR.decode(eventResult).isRight()) {
    onError(ErrorsType.CONNECTION);
  } else if (PAYMENT_ACTION_DELETE_SVR_ERR.decode(eventResult).isRight()) {
    onError(ErrorsType.SERVER);
  } else {
    onError(ErrorsType.GENERIC_ERROR);
  }
};
