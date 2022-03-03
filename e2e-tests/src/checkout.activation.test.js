import { selectForm, verifyPaymen } from './utils/helpers.js';

describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = 'http://localhost:1234/'; // TODO: update to DEV/UAT env
  const PAID_NOTICE_CODE = '002720356866984253';
  const PAID_FISCAL_CODE_PA = '01199250158';
  const INVALID_NOTICE_CODE = '002720356512737900';
  const INVALID_FISCAL_CODE_PA = '77777777799';
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

  it('Should return a message indicating duplicate payment if the notice_code has already been paid', async () => {
    /**
     * 1. Payment Activation with paid notice code
     *  */
    await selectForm(PAID_NOTICE_CODE, PAID_FISCAL_CODE_PA);
    await new Promise(r => setTimeout(r, 10000));
  });
});
