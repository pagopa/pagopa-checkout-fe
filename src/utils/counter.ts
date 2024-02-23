/**
 * Creates a counter object with initial value.
 * @param {number} [initialValue=0] - The initial value of the counter. Defaults to 0 if not provided.
 * @returns {Object} - Counter object with methods.
 */
export const createCounter = (initialValue = 0) => {
  // eslint-disable-next-line functional/no-let
  let counter = initialValue;

  /**
   * Retrieves the current value of the counter.
   * @returns {number} - The current value of the counter.
   */
  const getValue = () => counter;

  /**
   * Increments the counter by the specified value.
   * @param {number} [value=1] - The value to increment the counter by. Defaults to 1 if not provided.
   * @returns {void}
   */
  const increment = (value = 1) => {
    counter += value;
  };

  /**
   * Decrements the counter by the specified value.
   * @param {number} [value=1] - The value to decrement the counter by. Defaults to 1 if not provided.
   * @returns {void}
   */
  const decrement = (value = 1) => {
    counter -= value;
  };

  /**
   * Checks if the counter is zero.
   * @returns {boolean} - True if the counter is zero, false otherwise.
   */
  const isZero = () => !counter;

  /**
   * Resets the counter to zero.
   * @returns {void}
   */
  const reset = () => {
    counter = 0;
  };

  return {
    getValue,
    increment,
    decrement,
    isZero,
    reset,
  };
};
