/**
 * NPG SDK loader with Subresource Integrity (SRI) check.
 *
 * Self-hosted model: the NPG SDK is served same-origin from our own storage,
 * together with its integrity hash (published atomically by a scheduled job).
 * This loader fetches the published hash and loads the SDK with the `integrity`
 * attribute set, for PCI SAQ-A compliance. Because the SDK is served
 * same-origin, no `crossorigin` attribute is needed.
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
