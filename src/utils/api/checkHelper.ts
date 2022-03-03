import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { BrowserInfoResponse } from "../../../generated/definitions/payment-transactions-api/BrowserInfoResponse";
import { Client } from "../../../generated/definitions/payment-transactions-api/client";

export const getBrowserInfoTask = (
  iopayportalClient: Client
): TE.TaskEither<string, BrowserInfoResponse> =>
  pipe(
    () => iopayportalClient.GetBrowsersInfo({}),
    TE.mapLeft(() => "Errore recupero browserInfo"),
    TE.chainEitherK((response) => {
      if (response.status !== 200) {
        return E.left("Errore recupero browserInfo");
      } else {
        return E.right(response.value as BrowserInfoResponse);
      }
    })
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
