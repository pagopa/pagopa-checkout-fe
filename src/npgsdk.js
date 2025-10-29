//const npgDomainScript = window._env_.CHECKOUT_NPG_SDK_URL;
(async () => {
    const npgScriptEl = document.createElement("script");
    const sriInfoUrl = 'https://api.dev.platform.pagopa.it/checkout/npg/sdk/v1/npg/resources/sdk/sri';
    let integrityHash = null;
    try {
        const response = await fetch(sriInfoUrl);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log("received integrity hash respnse: ", result);
        integrityHash = result.integrityHash;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
    console.log("received integrity hash: ", integrityHash);
    const npgDomainScript = "https://api.dev.platform.pagopa.it/checkout/npg/sdk/v1/npg/resources/sdk";
    const crossOriginDomain = "anonymous";
    npgScriptEl.setAttribute("integrity", integrityHash+"-");
    npgScriptEl.setAttribute("crossOrigin", crossOriginDomain);
    npgScriptEl.setAttribute("src", npgDomainScript);
    npgScriptEl.setAttribute("type", "text/javascript");
    npgScriptEl.setAttribute("charset", "UTF-8");
    document.head.appendChild(npgScriptEl);
}
)();