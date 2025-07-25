import { responseOutcome, responseMessage } from "../responseOutcome";

describe("responseOutcome Record", () => {
  it("should contain all ViewOutcomeEnum values", () => {
    const expectedKeys = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 17, 18, 25, 116, 117, 121,
    ];

    expectedKeys.forEach((key) => {
      expect(responseOutcome).toHaveProperty(key.toString());
    });
  });

  it("each entry should have the correct structure", () => {
    Object.values(responseOutcome).forEach((message: responseMessage) => {
      expect(message).toHaveProperty("title");
      expect(message).toHaveProperty("icon");
    });
  });
});
