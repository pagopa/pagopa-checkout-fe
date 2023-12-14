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
  name: ROUTE_FRAGMENT
): string {
  try {
    const fragment = new URL(uri).hash.substring(1);
    const urlParams = new URLSearchParams(fragment);
    const gdiFragmentUrl = urlParams.get(name);
    if (gdiFragmentUrl === null) {
      return "";
    }

    return Buffer.from(gdiFragmentUrl, "base64").toString("ascii");
  } catch (e) {
    return "";
  }
}
