/**
 * NPG SDK loader with Subresource Integrity (SRI) check.
 *
 * Self-hosted model: the NPG SDK is served from a pagoPA-controlled CDN (the
 * platform CDN), together with its integrity hash (published atomically by a
 * scheduled job). This loader fetches the published hash and loads the SDK with
 * the `integrity` attribute set, for PCI SAQ-A compliance. The SDK is served
 * cross-origin (platform CDN vs the checkout host), so the script is loaded
 * with `crossorigin="anonymous"`: the browser cannot validate SRI on a
 * cross-origin resource fetched without CORS.
 *
 * No permissive fallback: SDK and hash are aligned by construction, so a hash
 * mismatch should never happen in normal operation. If the hash cannot be
 * fetched or SRI validation fails, the SDK is intentionally NOT loaded without
 * integrity -> a payment must never proceed with an unvalidated SDK.
 */
const loadNpgSDK = async () => {
  const sdkUrl = window._env_.CHECKOUT_NPG_SDK_URL;
  const integrityUrl = window._env_.CHECKOUT_NPG_SDK_INTEGRITY_URL;

  try {
    const response = await fetch(integrityUrl);
    if (!response.ok) {
      throw new Error(`Integrity endpoint returned HTTP ${response.status}`);
    }
    const { integrityHash } = await response.json();
    if (!integrityHash) {
      throw new Error("Integrity hash missing from response");
    }

    const script = document.createElement("script");
    script.setAttribute("src", sdkUrl);
    script.setAttribute("type", "text/javascript");
    script.setAttribute("charset", "UTF-8");
    script.setAttribute("integrity", integrityHash);
    // Cross-origin load from the platform CDN: SRI can only be validated with CORS.
    script.setAttribute("crossorigin", "anonymous");
    // SRI validation failure or load error: the SDK simply stays unloaded so no payment can use it.
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
