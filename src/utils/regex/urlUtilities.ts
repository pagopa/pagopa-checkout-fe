import { ROUTE_FRAGMENT } from "routes/models/routeModel";

export function getUrlParameter(name: string) {
  const myname = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + myname + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * This function requires a valid base64-encoded URI with a querystrings as the fragment URI
 * example: http://dev.checkout.it/gdi-check#param1=value1&param2=value2.
 * The function return an ampty string if the uri parameter is not valid
 * or the param can't be found
 */
export function getFragmentParameter(
  uri: string,
  name: ROUTE_FRAGMENT,
  useBase64Decoding = true
): string {
  try {
    const fragment = new URL(uri).hash.substring(1);
    const urlParams = new URLSearchParams(fragment);
    const param = urlParams.get(name);
    if (param === null) {
      return "";
    }

    return useBase64Decoding
      ? Buffer.from(param, "base64").toString("ascii")
      : param;
  } catch (e) {
    return "";
  }
}

/**
 * This function requires a valid URI with a query strings as the fragment URI
 * example: http://dev.checkout.it/gdi-check#param1=value1&param2=value2.
 * The function return an empty string if the uri parameter is not valid
 * or the parameter can't be found
 */
function getFragmentParameterFromUri(uri: string, name: string): string {
  try {
    const fragment = new URL(uri).hash.substring(1);
    const urlParams = new URLSearchParams(fragment);
    const gdiFragmentUrl = urlParams.get(name);
    if (gdiFragmentUrl === null) {
      return "";
    }
    return urlParams.get(name) || "";
  } catch (e) {
    return "";
  }
}

/**
 * returns all requested fragments in an object using the fragments as keys
 * example: http://dev.checkout.it/gdi-check#param1=value1&param2=value2&param3&....
 * The object values are set to empty string if its fragment is not found
 * or the parameter can't be found
 */
export function getUriFragments(
  ...fragments: Array<ROUTE_FRAGMENT>
): Record<ROUTE_FRAGMENT, string> {
  const uri = window.location.href;
  return fragments.reduce<Record<string, string>>(
    (acc, fragment) => ({
      ...acc,
      [fragment]: getFragmentParameterFromUri(uri, fragment),
    }),
    {}
  );
}
