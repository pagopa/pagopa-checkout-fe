import { sortBy } from "../../features/payment/components/PaymentPspDrawer/PaymentPspDrawer";

describe("sortBy function", () => {
  const bundles = [
    { taxPayerFee: 100 },
    { taxPayerFee: 200 },
    { taxPayerFee: 150 },
    { taxPayerFee: undefined },
  ];

  describe("when sorting in ascending order", () => {
    test("sorts bundles correctly", () => {
      const sorted = JSON.parse(JSON.stringify(bundles)).sort(
        sortBy("taxPayerFee", "asc")
      ); // Deep copy
      expect(sorted).toEqual([
        { taxPayerFee: 100 },
        { taxPayerFee: 150 },
        { taxPayerFee: 200 },
        { taxPayerFee: undefined },
      ]);
    });

    test("places undefined values at the end", () => {
      const sorted = JSON.parse(JSON.stringify(bundles)).sort(
        sortBy("taxPayerFee", "asc")
      ); // Deep copy
      expect(sorted[sorted.length - 1].taxPayerFee).toBeUndefined();
    });
  });

  describe("when sorting in descending order", () => {
    test("sorts bundles correctly", () => {
      const sorted = JSON.parse(JSON.stringify(bundles)).sort(
        sortBy("taxPayerFee", "desc")
      ); // Deep copy
      expect(sorted).toEqual([
        { taxPayerFee: 200 },
        { taxPayerFee: 150 },
        { taxPayerFee: 100 },
        { taxPayerFee: undefined },
      ]);
    });

    test("places undefined values at the end", () => {
      const sorted = JSON.parse(JSON.stringify(bundles)).sort(
        sortBy("taxPayerFee", "desc")
      ); // Deep copy
      expect(sorted[sorted.length - 1].taxPayerFee).toBeUndefined();
    });
  });

  describe("when comparing undefined fields", () => {
    test("returns -1 for undefined field in ascending order", () => {
      const result = sortBy("taxPayerFee", "asc")(
        { taxPayerFee: undefined },
        { taxPayerFee: 100 }
      );
      expect(result).toBe(-1);
    });

    test("returns 1 for undefined field in descending order", () => {
      const result = sortBy("taxPayerFee", "desc")(
        { taxPayerFee: undefined },
        { taxPayerFee: 100 }
      );
      expect(result).toBe(1);
    });
  });
});
