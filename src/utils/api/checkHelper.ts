import {
  fromLeft,
  taskEither,
  TaskEither,
  tryCatch,
} from "fp-ts/lib/TaskEither";
import { BrowserInfoResponse } from "../../../generated/definitions/payment-transactions-api/BrowserInfoResponse";
import { Client } from "../../../generated/definitions/payment-fn-api/client";

export const getBrowserInfoTask = (
  iopayportalClient: Client
): TaskEither<string, BrowserInfoResponse> =>
  tryCatch(
    () => iopayportalClient.GetBrowsersInfo({}),
    () => "Errore recupero browserInfo"
  ).foldTaskEither(
    (err) => fromLeft(err),
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft("Errore recupero browserInfo"),
        (responseType) =>
          responseType.status !== 200
            ? fromLeft(`Errore recupero browserInfo : ${responseType.status}`)
            : taskEither.of(responseType.value)
      )
  );

/**
 * This function return a EMV compliant color depth
 * or take the maximum valid colorDepth below the given colorDepth.
 * @param colorDepth  (number)
 * @returns EMV compliant colorDepth (number)
 */
export const getEMVCompliantColorDepth = (colorDepth: number): number => {
  const validColorsDepths: Array<number> = [1, 4, 8, 15, 16, 24, 32, 48];
  const maxValidColorDepthsLength: number = 48;

  const maybeValidColor = validColorsDepths.includes(colorDepth)
    ? colorDepth
    : validColorsDepths.find(
        (validColorDepth, index) =>
          validColorDepth < colorDepth &&
          colorDepth < validColorsDepths[index + 1]
      );

  return maybeValidColor === undefined
    ? maxValidColorDepthsLength
    : maybeValidColor;
};
