/**
 * Detects if the current browser is Safari
 * @returns true if Safari, false otherwise
 */
export const isSafari = (): boolean => {
  if (typeof window === "undefined" || !navigator?.userAgent) {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // Safari detection: has "safari" but NOT "chrome" or "crios" (Chrome on iOS)
  return (
    /safari/.test(userAgent) &&
    !/chrome/.test(userAgent) &&
    !/crios/.test(userAgent)
  );
};

/**
 * Get the userDevice value for payment methods API based on browser detection
 *
 * For Checkout (web users):
 * - Safari browser → SAFARI
 * - All other browsers → WEB
 *
 * For IO App:
 * - iOS device → IOS
 * - Android device → ANDROID
 *
 * @param clientId - Optional client identifier (e.g., "IO", "CHECKOUT")
 * @param platformFromIOApp - Optional platform info from IO app ("IOS" or "ANDROID")
 * @returns UserDevice string literal for the API ("IOS" | "ANDROID" | "SAFARI" | "WEB")
 */
export const getUserDevice = (
  clientId?: string,
  platformFromIOApp?: "IOS" | "ANDROID"
):
  | typeof UserDeviceValues.IOS
  | typeof UserDeviceValues.ANDROID
  | typeof UserDeviceValues.SAFARI
  | typeof UserDeviceValues.WEB
  | undefined => {
  // ff the request comes fom IO app and OS info is provided, use it
  if (clientId === "IO" && platformFromIOApp) {
    return platformFromIOApp === "IOS"
      ? UserDeviceValues.IOS
      : UserDeviceValues.ANDROID;
  }

  // for CHECKOUT users, detect Safari vs other browsers
  if (clientId === "CHECKOUT" || clientId === "CHECKOUT_CART" || !clientId) {
    return isSafari() ? UserDeviceValues.SAFARI : UserDeviceValues.WEB;
  }

  // ff IO app but no OS info, return undefined
  return undefined;
};

/**
 * Constant values matching the UserDeviceEnum from the API
 */
export const UserDeviceValues = {
  IOS: "IOS" as const,
  ANDROID: "ANDROID" as const,
  SAFARI: "SAFARI" as const,
  WEB: "WEB" as const,
};
