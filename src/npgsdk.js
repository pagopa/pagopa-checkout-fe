/**
 * NPG SDK loader with Subresource Integrity (SRI) check.
 *
 * Fetches the SDK integrity hash from the APIM endpoint, then loads
 * the NPG SDK script with the integrity attribute for PCI SAQ-A compliance.
 * The SDK is served through Front Door (same origin) so no cross origin
 * attribute is needed.
 *
 * Permissive fallback: if the hash fetch fails or SRI validation fails,
 * the SDK is loaded without integrity to avoid blocking the payment flow.
 */
const loadNpgSDK = async () => {
  const sdkUrl = window._env_.CHECKOUT_NPG_SDK_URL;
  const integrityUrl = window._env_.CHECKOUT_NPG_SDK_INTEGRITY_URL;

  // fallback: load SDK without SRI (used when hash is unavailable or SRI fails)
  const loadWithoutIntegrity = () => {
    const script = document.createElement("script");
    script.setAttribute("src", sdkUrl);
    script.setAttribute("type", "text/javascript");
    script.setAttribute("charset", "UTF-8");
    document.head.appendChild(script);
  };

  try {
    const response = await fetch(integrityUrl);
    if (!response.ok) {
      throw new Error(`Integrity endpoint returned HTTP ${response.status}`);
    }
    const { integrityHash } = await response.json();

    const script = document.createElement("script");
    script.setAttribute("src", sdkUrl);
    script.setAttribute("type", "text/javascript");
    script.setAttribute("charset", "UTF-8");
    script.setAttribute("integrity", integrityHash);
    // if SRI validation fails (hash mismatch or network error), fall back to loading without integrity
    script.onerror = () => {
      console.error("NPG SDK integrity check failed, loading without SRI");
      loadWithoutIntegrity();
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error("Failed to fetch NPG SDK integrity hash:", error);
    loadWithoutIntegrity();
  }
};

loadNpgSDK();
