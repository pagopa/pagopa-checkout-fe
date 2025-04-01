import { truncateText } from "../../../utils/transformers/text";

describe("truncateText", () => {
  it("should return the original text if it is shorter than the limit", async () => {
    const text = "Hello World";
    const limit = 20;
    expect(truncateText(text, limit)).toBe(text);
  });

  it("should return the original text if it is equal to the limit", async () => {
    const text = "Exactly twenty chars";
    const limit = 20;
    expect(truncateText(text, limit)).toBe(text);
  });

  it("should truncate text to 30 chars and add ellipsis if text is longer than the limit but shorter/equal to 30", async () => {
    const text = "This text is longer than 20.";
    const limit = 20;
    const expected = "This text is longer than 20....";
    expect(truncateText(text, limit)).toBe(expected);
  });

  it("should truncate text to 30 chars and add ellipsis if text is longer than the limit and longer than 30", async () => {
    const text =
      "This is a much longer text that definitely exceeds thirty characters";
    const limit = 20;
    const expected = "This is a much longer text tha...";
    expect(truncateText(text, limit)).toBe(expected);
  });

  it("should use the default limit of 20 when limit is not provided", async () => {
    const text = "This text is definitely longer than the default twenty limit";
    const expected = "This text is definitely longer...";
    expect(truncateText(text)).toBe(expected);
  });

  it("should handle short text with the default limit", async () => {
    const text = "Short";
    expect(truncateText(text)).toBe(text);
  });

  it("should return an empty string if the input is an empty string", async () => {
    const text = "";
    expect(truncateText(text, 10)).toBe(text);
    expect(truncateText(text)).toBe(text);
  });

  it("should add ellipsis if text length is greater than limit, even if limit is small", async () => {
    const text = "Test";
    const limit = 2;
    const expected = "Test...";
    expect(truncateText(text, limit)).toBe(expected);
  });
});
