/* eslint-disable functional/immutable-data, no-underscore-dangle */
/**
 * Tests for the NPG SDK SRI loader (src/npgsdk.js).
 *
 * The loader self-invokes on import: it fetches the integrity hash JSON and,
 * only on success, appends a <script> carrying the `integrity` attribute.
 * There is no permissive fallback -> on any failure the SDK must NOT be appended.
 */

const SDK_URL = "https://checkout.example.it/npg/hfsdk.js";
const INTEGRITY_URL = "https://checkout.example.it/npg/hfsdk.integrity.json";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const getNpgScript = () =>
  document.head.querySelector(`script[src="${SDK_URL}"]`);

const loadModule = () =>
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../npgsdk");
  });

describe("npgsdk loader", () => {
  beforeEach(() => {
    jest.resetModules();
    document.head.innerHTML = "";
    (window as any)._env_ = {
      CHECKOUT_NPG_SDK_URL: SDK_URL,
      CHECKOUT_NPG_SDK_INTEGRITY_URL: INTEGRITY_URL,
    };
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).fetch;
  });

  it("loads the SDK with the integrity attribute on success", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ integrityHash: "sha384-abc123" }),
    });

    loadModule();
    await flushPromises();

    const script = getNpgScript();
    expect(script).not.toBeNull();
    expect(script?.getAttribute("integrity")).toBe("sha384-abc123");
    expect(script?.getAttribute("crossorigin")).toBe("anonymous");
    expect((global as any).fetch).toHaveBeenCalledWith(INTEGRITY_URL);
  });

  it("does not load the SDK when the integrity endpoint returns a non-OK response", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    loadModule();
    await flushPromises();

    expect(getNpgScript()).toBeNull();
  });

  it("does not load the SDK when the hash fetch rejects", async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("network"));

    loadModule();
    await flushPromises();

    expect(getNpgScript()).toBeNull();
  });

  it("does not load the SDK when the integrity hash is missing from the response", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    loadModule();
    await flushPromises();

    expect(getNpgScript()).toBeNull();
  });
});
