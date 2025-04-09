import { responseOutcome, responseMessage } from "../responseOutcome";

describe("responseOutcome Record", () => {
  test("should contain all ViewOutcomeEnum values", () => {
    const expectedKeys = [0, 1, 2, 3, 4, 7, 8, 10, 17, 18, 25, 116, 117, 121];

    expectedKeys.forEach((key) => {
      expect(responseOutcome).toHaveProperty(key.toString());
    });
  });

  test("each entry should have the correct structure", () => {
    Object.values(responseOutcome).forEach((message: responseMessage) => {
      expect(message).toHaveProperty("title");
      expect(message).toHaveProperty("icon");
    });
  });
});
