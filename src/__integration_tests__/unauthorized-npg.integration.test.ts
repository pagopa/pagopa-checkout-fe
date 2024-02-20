import { payNotice, acceptCookiePolicy } from "./utils/helpers";

describe("Unauthorized npg final status mapping tests", () => {

/**
   * Test input and configuration
*/
  
const CHECKOUT_URL = "http://localhost:1234/";
const CHECKOUT_URL_AFTER_AUTHORIZATION = "http://localhost:1234/esito";
const VALID_FISCAL_CODE = "77777777777";
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
  number: "4333334000098346",
  expirationDate: "1230",
  ccv: "123",
  holderName: "Mario Rossi",
};

 
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_UNKNOWN_ERROR_CODE="302016723740200074";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_AUTHORIZED="302016723740200075";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_PENDING="302016723740200076";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_VOIDED="302016723740200077";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_REFUNDED="302016723740200078";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_FAILED="302016723740200079";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_CANCELED="302016723740200080";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DENIED_BY_RISK="302016723740200081";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_THREEDS_VALIDATED="302016723740200082";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_THREEDS_FAILED="302016723740200083";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_100= "302016723740200084";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_101= "302016723740200085";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_102= "302016723740200086";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_104= "302016723740200087";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_106= "302016723740200088";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_109= "302016723740200089";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_110= "302016723740200090";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_111= "302016723740200091";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_115= "302016723740200092";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_116= "302016723740200093";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_117= "302016723740200094";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_118= "302016723740200095";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_119= "302016723740200096";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_120= "302016723740200097";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_121= "302016723740200098";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_122= "302016723740200099";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_123= "302016723740200100";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_124= "302016723740200101";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_125= "302016723740200102";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_126= "302016723740200103";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_129= "302016723740200104";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_200= "302016723740200105";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_202= "302016723740200106";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_204= "302016723740200107";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_208= "302016723740200108";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_209= "302016723740200109";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_210= "302016723740200110";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_413= "302016723740200111";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_888= "302016723740200112";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_902= "302016723740200113";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_903= "302016723740200114";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_904= "302016723740200115";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_906= "302016723740200116";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_907= "302016723740200117";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_908= "302016723740200118";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_909= "302016723740200119";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_911= "302016723740200120";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_913= "302016723740200121";
const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_999= "302016723740200122";


  /**
   * Increase default test timeout (80000ms)
   * to support entire payment flow
    */
  jest.setTimeout(120000);
  jest.retryTimes(1);
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(120000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and unknown error code", async () => {
    const resultMessage = await payNotice(
      UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_UNKNOWN_ERROR_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      CHECKOUT_URL_AFTER_AUTHORIZATION
    );
  
    expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
  });

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status AUTHORIZED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_AUTHORIZED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status PENDING", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_PENDING,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status VOIDED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_VOIDED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status REFUNDED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_REFUNDED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status FAILED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_FAILED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DENIED_BY_RISK", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DENIED_BY_RISK,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});


it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status THREEDS_VALIDATED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_THREEDS_VALIDATED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});


it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status THREEDS_FAILED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_THREEDS_FAILED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});


it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status CANCELED", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_CANCELED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("L’operazione è stata annullata");
});


it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 100", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_100,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 101", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_101,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 102", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_102,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 104", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_104,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 106", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_106,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 109", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_109,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 110", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_110,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 111", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_111,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 115", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_115,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 116", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_116,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 117", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_117,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 118", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_118,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 119", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_119,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 120", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_120,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 121", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_121,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 122", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_122,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 123", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_123,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 124", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_124,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 125", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_125,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 126", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_126,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 129", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_129,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 200", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_200,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 202", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_202,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 204", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_204,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 208", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_208,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 209", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_209,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 210", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_210,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 413", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_413,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 888", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_888,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 902", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_902,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 903", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_903,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 904", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_904,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 906", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_906,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 907", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_907,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 908", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_908,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 909", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_909,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 911", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_911,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 109", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_913,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

it.skip("Should fails - final status UNATHORIZED with NPG gateway authorization status DECLINED and error code 999", async () => {
  const resultMessage = await payNotice(
    UNAUTHORIZED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_999,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto.");
});

});