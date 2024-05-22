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

const eCommerceFrontendPathNameRegex = new RegExp(process.env.CHECKOUT_ECOMMERCE_FRONTEND_REDIRECT_REGEX || "^\/ecommerce-fe");
export const isEcommerceFrontendRedirection = (url: URL) =>
  eCommerceFrontendPathNameRegex.test(url.pathname);
