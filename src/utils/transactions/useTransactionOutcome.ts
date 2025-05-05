import { useState, useEffect, useRef } from "react";
import { isLeft } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";
import { apiPaymentEcommerceClient } from "utils/api/client";
import { getConfigOrThrow } from "utils/config/config";
import type { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import { ViewOutcomeEnum } from "./TransactionResultUtil";

export interface OutcomeData {
  outcome: ViewOutcomeEnum;
  isFinalStatus: boolean;
  loading: boolean;
  error?: Error;
}

export function useTransactionOutcome(
  transactionId: string,
  bearerAuth: string
): OutcomeData {
  const { CHECKOUT_POLLING_ACTIVATION_INTERVAL } = getConfigOrThrow();

  const [state, setState] = useState<OutcomeData>({
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
    isFinalStatus: false,
    loading: true,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const fetchOnce = async () => {
      try {
        const v = await apiPaymentEcommerceClient.getTransactionOutcomes({
          bearerAuth,
          transactionId,
        });
        if (isLeft(v)) {
          throw new Error(PathReporter.report(v).join("; "));
        }
        const resp = v.right;
        if (resp.status !== 200) {
          throw new Error(`Unexpected HTTP status ${resp.status}`);
        }

        const info = resp.value as TransactionOutcomeInfo;
        const { outcome: rawOutcome, isFinalStatus } = info;

        const key = rawOutcome?.toString() as keyof typeof ViewOutcomeEnum;
        const mappedOutcome =
          ViewOutcomeEnum[key] ?? ViewOutcomeEnum.GENERIC_ERROR;

        if (!mounted.current) {
          return;
        }
        setState({
          outcome: mappedOutcome,
          isFinalStatus,
          loading: !isFinalStatus,
        });

        if (!isFinalStatus) {
          setTimeout(fetchOnce, CHECKOUT_POLLING_ACTIVATION_INTERVAL);
        }
      } catch (err) {
        if (!mounted.current) {
          return;
        }
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    };

    fetchOnce();
    return () => {
      mounted.current = false;
    };
  }, [transactionId, bearerAuth, CHECKOUT_POLLING_ACTIVATION_INTERVAL]);

  return state;
}
