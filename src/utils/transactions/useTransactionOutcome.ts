import { useState, useEffect } from "react";
import { isLeft } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";
import { createClient } from "../../../generated/definitions/payment-ecommerce/client";
import type { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import { ViewOutcomeEnum } from "./TransactionResultUtil";

export interface OutcomeData {
  outcome: ViewOutcomeEnum;
  totalAmount?: number;
  loading: boolean;
  error?: Error;
}

export function useTransactionOutcome(
  transactionId: string,
  bearerAuth: string
): OutcomeData {
  const [state, setState] = useState<OutcomeData>({
    outcome: ViewOutcomeEnum.GENERIC_ERROR,
    loading: true,
  });

  useEffect(() => {
    const client = createClient({
      baseUrl: process.env.REACT_APP_API_URL!,
      fetchApi: fetch,
    });

    client
      .getTransactionOutcomes({ transactionId, bearerAuth })
      .then((validation) => {
        if (isLeft(validation)) {
          const msg = PathReporter.report(validation).join("; ");
          setState({
            outcome: ViewOutcomeEnum.GENERIC_ERROR,
            loading: false,
            error: new Error(`Decoder errors: ${msg}`),
          });
          return;
        }
        const response = validation.right;

        if (response.status !== 200) {
          setState({
            outcome: ViewOutcomeEnum.GENERIC_ERROR,
            loading: false,
            error: new Error(`Unexpected response status ${response.status}`),
          });
          return;
        }

        const info = response.value as TransactionOutcomeInfo;
        const raw = info.outcome?.toString() as keyof typeof ViewOutcomeEnum;
        const outcome = ViewOutcomeEnum[raw] ?? ViewOutcomeEnum.GENERIC_ERROR;

        setState({
          outcome,
          totalAmount: info.totalAmount,
          loading: false,
        });
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      });
  }, [transactionId, bearerAuth]);

  return state;
}
