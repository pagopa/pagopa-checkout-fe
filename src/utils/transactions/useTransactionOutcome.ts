import { useState, useEffect, useRef } from "react";
import { isLeft } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";
import { apiPaymentEcommerceClient } from "../../utils/api/client";
import { getConfigOrThrow } from "../../utils/config/config";
import type { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import { ViewOutcomeEnum } from "./TransactionResultUtil";

/**
 * Polls the backend for `TransactionOutcomeInfo` until a final status is reached.
 * Centralizes retry logic so pages no longer need to duplicate setTimeout/fetch.
 */
export interface OutcomeData {
  outcome: ViewOutcomeEnum;
  isFinalStatus: boolean;
  totalAmount?: number;
  loading: boolean;
  error?: Error;
}

export function useTransactionOutcome(
  transactionId: string,
  bearerAuth: string
): OutcomeData {
  // read polling interval from config
  const { CHECKOUT_POLLING_ACTIVATION_INTERVAL } = getConfigOrThrow();

  // initial state: show loading and generic error until first response
  const [state, setState] = useState<OutcomeData>({
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
    isFinalStatus: false,
    loading: true,
  });

  // useRef to track if the component is mounted
  const mounted = useRef(true);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    mounted.current = true;

    // single fetch + decode + state update
    const fetchOnce = async () => {
      try {
        const v = await apiPaymentEcommerceClient.getTransactionOutcomes({
          bearerAuth,
          transactionId,
        });

        // check if the response is a left value (error)
        if (isLeft(v)) {
          throw new Error(PathReporter.report(v).join("; "));
        }
        const resp = v.right;

        // non-200 statuses are unexpected; treat as error
        if (resp.status !== 200) {
          throw new Error(`Unexpected HTTP status ${resp.status}`);
        }

        // extract the raw outcome, final status and amount+fees
        const info = resp.value as TransactionOutcomeInfo;
        const { outcome: rawOutcome, isFinalStatus, totalAmount, fees } = info;

        const baseAmount = Number(totalAmount ?? 0);
        const feeAmount = Number(fees ?? 0);
        const amountAndFees = baseAmount + feeAmount;

        // map the raw code string into our ViewOutcomeEnum
        const key = rawOutcome?.toString() as keyof typeof ViewOutcomeEnum;
        const mappedOutcome =
          ViewOutcomeEnum[key] ?? ViewOutcomeEnum.GENERIC_ERROR;

        if (!mounted.current) {
          return; // avoid state update if unmounted
        }

        // update loading/outcome/isFinalStatus/amount
        setState({
          outcome: mappedOutcome,
          isFinalStatus,
          loading: !isFinalStatus,
          totalAmount: amountAndFees,
        });

        // if not final, schedule the next poll
        if (!isFinalStatus) {
          setTimeout(
            () => void fetchOnce(),
            CHECKOUT_POLLING_ACTIVATION_INTERVAL
          );
        }
      } catch (err) {
        if (!mounted.current) {
          return;
        }
        // on any error, set loading to false and show the error
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    };

    // start the first fetch
    void fetchOnce();

    // cleanup function to avoid state updates if unmounted
    return () => {
      // eslint-disable-next-line functional/immutable-data
      mounted.current = false;
    };
  }, [transactionId, bearerAuth, CHECKOUT_POLLING_ACTIVATION_INTERVAL]);

  return state;
}
