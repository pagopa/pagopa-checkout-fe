import { createCounter } from "../counter";

describe("createCounter", () => {
  /* eslint-disable functional/no-let */
  let counter: {
    getValue: any;
    increment: any;
    decrement: any;
    isZero: any;
    reset: any;
  };

  beforeEach(() => {
    sessionStorage.clear();
    counter = createCounter();
  });

  test("should initialize with default value of 0", () => {
    expect(counter.getValue()).toBe(0);
  });

  test("should initialize with a given value", () => {
    const customCounter = createCounter(10);
    expect(customCounter.getValue()).toBe(10);
  });

  test("should increment by 1 by default", () => {
    counter.increment();
    expect(counter.getValue()).toBe(1);
  });

  test("should increment by a given value", () => {
    counter.increment(5);
    expect(counter.getValue()).toBe(5);
  });

  test("should decrement by 1 by default", () => {
    counter.decrement();
    expect(counter.getValue()).toBe(-1);
  });

  test("should decrement by a given value", () => {
    counter.decrement(3);
    expect(counter.getValue()).toBe(-3);
  });

  test("should return true for isZero when counter is zero", () => {
    expect(counter.isZero()).toBe(true);
  });

  test("should return false for isZero when counter is not zero", () => {
    counter.increment();
    expect(counter.isZero()).toBe(false);
  });

  test("should reset the counter to zero", () => {
    counter.increment(10);
    counter.reset();
    expect(counter.getValue()).toBe(0);
  });
});

describe("createCounter with sessionStorage", () => {
  const storageKey = "testCounterKey";

  beforeEach(() => {
    sessionStorage.clear();
  });

  test("should read initial value from sessionStorage if present", () => {
    sessionStorage.setItem(storageKey, "42");
    const newCounter = createCounter(0, storageKey);
    expect(newCounter.getValue()).toBe(42);
  });

  test("should persist value to sessionStorage after increment", () => {
    const counter = createCounter(0, storageKey);
    counter.increment(3);
    expect(sessionStorage.getItem(storageKey)).toBe("3");
  });

  test("should persist value to sessionStorage after decrement", () => {
    const counter = createCounter(0, storageKey);
    counter.decrement(2);
    expect(sessionStorage.getItem(storageKey)).toBe("-2");
  });

  test("should reset and persist zero value to sessionStorage", () => {
    const counter = createCounter(10, storageKey);
    counter.reset();
    expect(sessionStorage.getItem(storageKey)).toBe("0");
  });

  test("should retain value after re-creating the counter (simulating refresh)", () => {
    const storageKey = "testCounterKey";
    let counter = createCounter(0, storageKey);
    counter.increment(7);
    // Simulate a page refresh with re-create the counter using the same storage key
    counter = createCounter(0, storageKey);
    expect(counter.getValue()).toBe(7);
  });

  test("should reset to initial value after sessionStorage is cleared", () => {
    const initialValue = 5;

    const counter1 = createCounter(initialValue, storageKey);
    counter1.increment(3);
    expect(counter1.getValue()).toBe(8);
    sessionStorage.clear();

    expect(sessionStorage.getItem(storageKey)).toBeNull();
    const counter2 = createCounter(initialValue, storageKey);
    expect(counter2.getValue()).toBe(initialValue);
  });
});
