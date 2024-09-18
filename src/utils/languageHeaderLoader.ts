// in italian browser this is 'it';
const loadHeaderLanguage = () => {
  return localStorage.getItem("i18nextLng") ?? window.navigator.language;
};

/**
 * this method will override the default XHR request handler and will enforce
 * a language header on any request
 */
const initXHRLanguageHeader = () => {
  // Save references to the original methods
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  // Override the open method
  (XMLHttpRequest.prototype as any).open = function (
    method: string,
    url: string | URL,
    async: boolean,
    username?: string | null | undefined,
    password?: string | null | undefined
  ) {
    (this as any)._url = url; // Store the URL for later use
    originalOpen.call(this, method, url, async, username, password);
  };

  // Override the send method
  XMLHttpRequest.prototype.send = function (
    body?: Document | XMLHttpRequestBodyInit | null
  ) {
    this.setRequestHeader("lang", loadHeaderLanguage());
    originalSend.call(this, body);
  };
};

const initFetchLanguageHeader = () => {
  // this code will override the default browser fetch function and it will make sure
  // that the language header is always set
  // Save the original fetch function
  const originalFetch = window.fetch;

  // Create a new fetch function
  window.fetch = async (input: any, init: RequestInit = {}) => {
    // Ensure the headers object exists
    init.headers = init.headers || {};

    // apply language header
    init.headers = { ...init.headers, lang: loadHeaderLanguage() };

    // Add your custom header
    init.headers as any;
    // Call the original fetch function with the modified init object
    return originalFetch(input, init);
  };
};

const initLanguageHeader = () => {
  initFetchLanguageHeader();
  initXHRLanguageHeader();
};

export default initLanguageHeader;
