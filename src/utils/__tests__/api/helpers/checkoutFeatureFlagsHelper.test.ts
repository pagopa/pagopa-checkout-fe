import { mockApiConfig } from "../../../../utils/testUtils";
import { apiCheckoutFeatureFlags } from "../../../api/client";
import { evaluateFeatureFlag } from "../../../api/helper";

jest.mock("../../../config/config", () => ({
  getConfigOrThrow: jest.fn(() => mockApiConfig),
}));

jest.mock("../../../api/client", () => ({
  apiCheckoutFeatureFlags: {
    evaluateFeatureFlags: jest.fn(),
  },
}));

afterEach(() => {
  jest.resetAllMocks();
});

describe("Checkout feature flags helper test", () => {
  const mockOnResponse: jest.Mock = jest.fn();
  const mockOnError: jest.Mock = jest.fn();

  it("Should call onResponse with the correct feature flag value", async () => {
    (apiCheckoutFeatureFlags.evaluateFeatureFlags as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          value: {
            isFeatureFlagEnabled: true,
          },
        },
      })
    );
    await evaluateFeatureFlag(
      "isFeatureFlagEnabled",
      mockOnError,
      mockOnResponse
    );
    expect(mockOnResponse).toHaveBeenCalledWith({ enabled: true });
  });

  it("Should call onError when api fail", async () => {
    (
      apiCheckoutFeatureFlags.evaluateFeatureFlags as jest.Mock
    ).mockRejectedValue("Api error");
    await evaluateFeatureFlag(
      "isFeatureFlagEnabled",
      mockOnError,
      mockOnResponse
    );
    expect(mockOnError).toHaveBeenCalledWith("Network error");
  });
});
