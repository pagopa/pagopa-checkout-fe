import { verifyPayment } from './utils/helpers.js';

describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = 'http://localhost:1234/'; // TODO: update to DEV/UAT env
  const VALID_FISCAL_CODE = '77777777777';
  const VALID_NOTICE_CODE = Math.floor(
    Math.random() * (302001999999999999 - 302001000000000000 + 1) + 302001000000000000,
  ).toString();

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
  });

  it('Should correctly verify a payment notification', async () => {
    /**
     * 1. Payment Activation with paid notice code
     *  */
    await verifyPayment(VALID_NOTICE_CODE, VALID_FISCAL_CODE);
  });
});
