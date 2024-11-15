import { sortBy } from "./../../utils/SortUtil";

const bundles = [
  { taxPayerFee: 100 },
  { taxPayerFee: 200 },
  { taxPayerFee: 150 },
  { taxPayerFee: undefined },
  { taxPayerFee: 0 },
];

test("sortBy function sorts bundles correctly in ascending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundles)).sort(
    sortBy("taxPayerFee", "asc")
  ); // Deep copy
  expect(sorted).toEqual([
    { taxPayerFee: 0 }, // 0 should come first
    { taxPayerFee: 100 },
    { taxPayerFee: 150 },
    { taxPayerFee: 200 },
    { taxPayerFee: undefined },
  ]);
});

test("sortBy function places undefined values at the end in ascending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundles)).sort(
    sortBy("taxPayerFee", "asc")
  ); // Deep copy
  expect(sorted[sorted.length - 1].taxPayerFee).toBeUndefined();
});

test("sortBy function sorts bundles correctly in descending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundles)).sort(
    sortBy("taxPayerFee", "desc")
  ); // Deep copy
  expect(sorted).toEqual([
    { taxPayerFee: 200 },
    { taxPayerFee: 150 },
    { taxPayerFee: 100 },
    { taxPayerFee: 0 }, // 0 should come before undefined
    { taxPayerFee: undefined },
  ]);
});

test("sortBy function places undefined values at the end in descending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundles)).sort(
    sortBy("taxPayerFee", "desc")
  ); // Deep copy
  expect(sorted[sorted.length - 1].taxPayerFee).toBeUndefined();
});

test("sortBy function returns 1 for undefined field in descending order", () => {
  const result = sortBy("taxPayerFee", "desc")(
    { taxPayerFee: undefined },
    { taxPayerFee: 100 }
  );
  expect(result).toBe(1);
});



const bundlesNames = [
  { pspBusinessName: "Business A" },
  { pspBusinessName: "Business C" },
  { pspBusinessName: "Business B" },
  { pspBusinessName: "Business D" },
  { pspBusinessName: undefined },
];

test("sortBy function sorts bundles by pspBusinessName correctly in ascending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundlesNames)).sort(
    sortBy("pspBusinessName", "asc")
  ); // Deep copy
  expect(sorted).toEqual([
    { pspBusinessName: "Business A" },
    { pspBusinessName: "Business B" },
    { pspBusinessName: "Business C" },
    { pspBusinessName: "Business D" },
    { pspBusinessName: undefined },
  ]);
});

test("sortBy function places undefined pspBusinessName values at the end in ascending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundlesNames)).sort(
    sortBy("pspBusinessName", "asc")
  ); // Deep copy
  expect(sorted[sorted.length - 1].pspBusinessName).toBeUndefined();
});

test("sortBy function sorts bundles by pspBusinessName correctly in descending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundlesNames)).sort(
    sortBy("pspBusinessName", "desc")
  ); // Deep copy
  expect(sorted).toEqual([
    { pspBusinessName: "Business C" },
    { pspBusinessName: "Business B" },
    { pspBusinessName: "Business A" },
    { pspBusinessName: "Business D" },
    { pspBusinessName: undefined },
  ]);
});

test("sortBy function places undefined pspBusinessName values at the end in descending order", () => {
  const sorted = JSON.parse(JSON.stringify(bundlesNames)).sort(
    sortBy("pspBusinessName", "desc")
  ); // Deep copy
  expect(sorted[sorted.length - 1].pspBusinessName).toBeUndefined();
});

test("sortBy function returns 1 for undefined pspBusinessName field in descending order", () => {
  const result = sortBy("pspBusinessName", "desc")(
    { pspBusinessName: undefined },
    { pspBusinessName: "Business A" }
  );
  expect(result).toBe(1);
});
