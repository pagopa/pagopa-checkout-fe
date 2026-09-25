/**
 * NPG SDK loader, with two modes selected by CHECKOUT_NPG_SDK_INTEGRITY_URL:
 *
 * - set: fetch the published hash and load the SDK with `integrity` +
 *   `crossorigin="anonymous"` (the SDK is self-hosted on the platform CDN,
 *   cross-origin, so SRI needs CORS). Fail closed: no hash, no SDK, because a
 *   payment must never run with an unvalidated SDK.
 * - empty: load the SDK from Nexi with no integrity (Nexi publishes no hash and
 *   sends no CORS). To disable SRI: blank the integrity URL, restore 
 *   the Nexi SDK URL and redeploy
 */
const buildScript = (sdkUrl) => {
  const script = document.createElement("script");
  script.setAttribute("src", sdkUrl);
  script.setAttribute("type", "text/javascript");
  script.setAttribute("charset", "UTF-8");
  return script;
};

const loadNpgSDK = async () => {
  const sdkUrl = window._env_.CHECKOUT_NPG_SDK_URL;
  const integrityUrl = window._env_.CHECKOUT_NPG_SDK_INTEGRITY_URL;

  // Legacy mode -> no SRI enabled, load the SDK without integrity
  if (!integrityUrl) {
    document.head.appendChild(buildScript(sdkUrl));
    return;
  }

  try {
    const response = await fetch(integrityUrl);
    if (!response.ok) {
      throw new Error(`Integrity endpoint returned HTTP ${response.status}`);
    }
    const { integrityHash } = await response.json();
    if (!integrityHash) {
      throw new Error("Integrity hash missing from response");
    }

    const script = buildScript(sdkUrl);
    script.setAttribute("integrity", integrityHash);
    script.setAttribute("crossorigin", "anonymous");
    script.onerror = () => {
      console.error(
        "NPG SDK failed to load or failed SRI validation; SDK not loaded"
      );
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error("Failed to load NPG SDK with integrity:", error);
  }
};

loadNpgSDK();
