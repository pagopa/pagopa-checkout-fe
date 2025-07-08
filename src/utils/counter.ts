/**
 * Creates a counter object with initial value.
 * @param {number} [initialValue=0] - The initial value of the counter. Defaults to 0 if not provided.
 * @param {string} [storageKey='counterPolling'] - The initial value of sessionStorage key. Deafaults to counterPolling if not provided
 * @returns {Object} - Counter object with methods.
 */
export const createCounter = ( initialValue = 0, storageKey = "counterPolling",) => {

  const savedValue = sessionStorage.getItem(storageKey);
  // eslint-disable-next-line functional/no-let
  let counter = savedValue !== null ? Number(savedValue) : initialValue;
  
  const saveValue = () => {
    sessionStorage.setItem(storageKey, counter.toString());
  };

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
    saveValue();
  };

  /**
   * Decrements the counter by the specified value.
   * @param {number} [value=1] - The value to decrement the counter by. Defaults to 1 if not provided.
   * @returns {void}
   */
  const decrement = (value = 1) => {
    counter -= value;
    saveValue();
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
    saveValue();
  };

  return {
    getValue,
    increment,
    decrement,
    isZero,
    reset,
  };
};
