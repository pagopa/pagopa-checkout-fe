export enum DeviceType {
  MOBILE = "MOBILE",
  TABLET = "TABLET",
  DESKTOP = "DESKTOP",
  UNKNOWN = "UNKNOWN",
}

export enum OperatingSystem {
  IOS = "IOS",
  IPADOS = "IPADOS",
  ANDROID = "ANDROID",
  WINDOWS = "WINDOWS",
  MACOS = "MACOS",
  LINUX = "LINUX",
  UNKNOWN = "UNKNOWN",
}

export enum BrowserType {
  CHROME = "CHROME",
  SAFARI = "SAFARI",
  FIREFOX = "FIREFOX",
  EDGE = "EDGE",
  UNKNOWN = "UNKNOWN",
}

export interface DeviceInfo {
  deviceType: DeviceType;
  operatingSystem: OperatingSystem;
  browserType: BrowserType;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
}

export const getOperatingSystem = (): OperatingSystem => {
  if (typeof window === "undefined" || !navigator?.userAgent) {
    return OperatingSystem.UNKNOWN;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // check for explicit iOS indicators first (iPhone)
  if (/iphone/.test(userAgent)) {
    return OperatingSystem.IOS;
  }

  // check for iPad - this catches old iPad user agents
  if (/ipad/.test(userAgent)) {
    return OperatingSystem.IPADOS;
  }

  // modern iPadOS detection: looks like macOS but has touch support
  if (/macintosh|mac os x/.test(userAgent)) {
    // if it's showing as MacOS but has touch support, it's iPadOS
    if (navigator.maxTouchPoints > 0 || "ontouchstart" in window) {
      return OperatingSystem.IPADOS;
    }
    return OperatingSystem.MACOS;
  }

  if (/android/.test(userAgent)) {
    return OperatingSystem.ANDROID;
  }

  if (/windows/.test(userAgent)) {
    return OperatingSystem.WINDOWS;
  }

  if (/linux/.test(userAgent)) {
    return OperatingSystem.LINUX;
  }

  return OperatingSystem.UNKNOWN;
};

export const getBrowserType = (): BrowserType => {
  if (typeof window === "undefined" || !navigator?.userAgent) {
    return BrowserType.UNKNOWN;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // check Edge before Chrome as it may contain Chrome in its user agent
  if (/edg/.test(userAgent)) {
    return BrowserType.EDGE;
  }

  // check for iOS Chrome (CriOS)
  if (/crios/.test(userAgent)) {
    return BrowserType.CHROME;
  }

  // check Chrome
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
    return BrowserType.CHROME;
  }

  // check Safari
  if (
    /safari/.test(userAgent) &&
    !/chrome/.test(userAgent) &&
    !/crios/.test(userAgent)
  ) {
    return BrowserType.SAFARI;
  }

  // check Firefox
  if (/firefox/.test(userAgent)) {
    return BrowserType.FIREFOX;
  }

  return BrowserType.UNKNOWN;
};

export const getDeviceType = (): DeviceType => {
  if (typeof window === "undefined") {
    return DeviceType.UNKNOWN;
  }

  const userAgent = navigator?.userAgent?.toLowerCase() || "";

  // check for mobile devices first
  if (/iphone|android.*mobile/.test(userAgent)) {
    return DeviceType.MOBILE;
  }

  // check for tablets - explicit iPad detection
  if (/ipad/.test(userAgent)) {
    return DeviceType.TABLET;
  }

  // modern iPad detection: macOS user agent + touch support = iPad
  if (/macintosh|mac os x/.test(userAgent)) {
    if (navigator?.maxTouchPoints > 0 || "ontouchstart" in window) {
      return DeviceType.TABLET;
    }
    return DeviceType.DESKTOP;
  }

  // android tablets (no "mobile" in user agent)
  if (/android(?!.*mobile)/.test(userAgent)) {
    return DeviceType.TABLET;
  }

  // desktop operating systems
  if (/windows|linux/.test(userAgent)) {
    return DeviceType.DESKTOP;
  }

  // if we can't determine from user agent, return UNKNOWN
  return DeviceType.UNKNOWN;
};

// does not matter for payment-methods list filtering but may be useful for analytics
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined" || !navigator) {
    return false;
  }

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

export const getDeviceInfo = (): DeviceInfo => {
  const deviceType = getDeviceType();
  const operatingSystem = getOperatingSystem();
  const browserType = getBrowserType();
  const userAgent = navigator?.userAgent || "";
  const screenWidth = window?.screen?.width || 0;
  const screenHeight = window?.screen?.height || 0;
  const touchDevice = isTouchDevice();

  return {
    deviceType,
    operatingSystem,
    browserType,
    userAgent,
    screenWidth,
    screenHeight,
    isTouchDevice: touchDevice,
  };
};

export const isApplePaySupported = (): boolean => {
  const os = getOperatingSystem();
  const browser = getBrowserType();

  // Apple Pay is supported on iOS Safari, iPadOS Safari, and macOS Safari
  // TODO check compatibility with non-Apple/non-Safari combo
  return (
    (os === OperatingSystem.IOS && browser === BrowserType.SAFARI) ||
    (os === OperatingSystem.IPADOS && browser === BrowserType.SAFARI) ||
    (os === OperatingSystem.MACOS && browser === BrowserType.SAFARI)
  );
};

export const isGooglePaySupported = (): boolean => {
  const browser = getBrowserType();

  // Google Pay is supported on Chrome and Edge
  // TODO check firefox compatibility
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1933884
  return browser === BrowserType.CHROME || browser === BrowserType.EDGE;
};
