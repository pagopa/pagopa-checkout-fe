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
 * - Safari browser → SAFARI
 * - All other browsers → WEB
 *
 * @returns UserDevice string literal for the API ("SAFARI" | "WEB")
 */
export const getUserDevice = ():
  | typeof UserDeviceValues.SAFARI
  | typeof UserDeviceValues.WEB =>
  isSafari() ? UserDeviceValues.SAFARI : UserDeviceValues.WEB;

/**
 * Constant values matching the UserDeviceEnum from the API
 */
export const UserDeviceValues = {
  IOS: "IOS" as const,
  ANDROID: "ANDROID" as const,
  SAFARI: "SAFARI" as const,
  WEB: "WEB" as const,
};
