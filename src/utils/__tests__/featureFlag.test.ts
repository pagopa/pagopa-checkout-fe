import featureFlags from "../featureFlags";

describe("featureFlags", () => {
  test("should have correct keys and values", () => {
    expect(featureFlags).toEqual({
      enableAuthentication: "isAuthenticationEnabled",
      enableMaintenance: "isMaintenancePageEnabled",
      enablePaymentMethodsHandler: "isPaymentMethodsHandlerEnabled",
      enablePspPage: "isPspPickerPageEnabled",
      enableScheduledMaintenanceBanner: "isScheduledMaintenanceBannerEnabled",
      enableWallet: "isPaymentWalletEnabled",
    });
  });

  test("should contain enableAuthentication flag", () => {
    expect(featureFlags).toHaveProperty(
      "enableAuthentication",
      "isAuthenticationEnabled"
    );
  });

  test("should contain enablePspPage flag", () => {
    expect(featureFlags).toHaveProperty(
      "enablePspPage",
      "isPspPickerPageEnabled"
    );
  });

  test("should contain enablePspPage flag", () => {
    expect(featureFlags).toHaveProperty(
      "enableMaintenance",
      "isMaintenancePageEnabled"
    );
  });

  test("should contain enableScheduledMaintenanceBanner flag", () => {
    expect(featureFlags).toHaveProperty(
      "enableScheduledMaintenanceBanner",
      "isScheduledMaintenanceBannerEnabled"
    );
  });

  test("should contain enableWallet flag", () => {
    expect(featureFlags).toHaveProperty(
      "enableWallet",
      "isPaymentWalletEnabled"
    );
  });
});
