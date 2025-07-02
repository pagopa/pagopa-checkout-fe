import featureFlags from "../featureFlags";

describe("featureFlags", () => {
  test("should have correct keys and values", () => {
    expect(featureFlags).toEqual({
      enableAuthentication: "isAuthenticationEnabled",
      enablePspPage: "isPspPickerPageEnabled",
      enableScheduledMaintenanceBanner: "isScheduledMaintenanceBannerEnabled",
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
      "enableScheduledMaintenanceBanner",
      "isScheduledMaintenanceBannerEnabled"
    );
  });
});
