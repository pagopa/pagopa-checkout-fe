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
