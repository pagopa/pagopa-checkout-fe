const scriptEl = document.createElement("script");
const domainScript = window._env_.CHECKOUT_ENV === "develop" ? "-test" : "";
scriptEl.setAttribute(
  "src",
  "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
);
scriptEl.setAttribute("type", "text/javascript");
scriptEl.setAttribute("charset", "UTF-8");
scriptEl.setAttribute(
  "data-domain-script",
  "c4394b6a-86ce-428c-a3d3-5b81cabbfed4" + domainScript
);
document.head.appendChild(scriptEl);
