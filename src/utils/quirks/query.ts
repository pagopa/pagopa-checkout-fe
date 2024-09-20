export function sanitizeSearchParams(searchParams: string): URLSearchParams {
  /*
   * Note: this function was introduced as part of CHK-3232.
   * ECs using the `POST /carts` API were manipulating incorrectly the returned redirect URL,
   * by adding query parameters incorrectly in an form-urlencoded URL and generating a malformed URL that
   * kept users from being able to use Checkout.
   * Here we heuristically sanitize the query parameters against invalid modifications and try to recover the
   * "correct" query parameters. Note that this behaviour is nonstandard.
   */

  const rawQueryParams = searchParams.slice(1).split("&");

  const sanitizedQueryParams = rawQueryParams
    .flatMap((p) => p.split("?").map(sanitizeSearchParam))
    .join("&");

  return new URLSearchParams("?" + sanitizedQueryParams);
}

function sanitizeSearchParam(searchParam: string) {
  const reservedCharacters = [";", "/", "?", ":", "@", "&", "=", "+", ",", "$"];
  const sanitizationMap: Record<string, string> = Object.fromEntries(
    reservedCharacters.map((c) => [c, encodeURIComponent(c)])
  );

  // eslint-disable-next-line functional/immutable-data
  sanitizationMap["?"] = "&"; // special handle stray question marks
  // eslint-disable-next-line functional/immutable-data
  sanitizationMap["="] = "="; // leave equal signs intact

  return reservedCharacters.reduce(
    (result, char) => result.replace(char, sanitizationMap[char]),
    searchParam
  );
}
