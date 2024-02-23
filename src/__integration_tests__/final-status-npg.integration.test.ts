import { acceptCookiePolicy } from "./utils/helpers";

describe("Unauthorized npg final status mapping tests", () => {

  /**
     * Test input and configuration
  */

  const CHECKOUT_OUTCOME_URL = "http://localhost:1234/esito";

  /**
   * Add all mock flow. Reference to the flow defined into the checkout be mock
   */
 
  const mockFlowWithExpectedResultMap = new Map([
    [
      "AUTHORIZATION_REQUESTED_NO_NPG_OUTCOME",
      { title: "AUTHORIZATION REQUESTED WITH NO NPG OUTCOME", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_EXECUTED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS EXECUTED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_AUTHORIZED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS AUTHORIZED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_PENDING",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS PENDING", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_VOIDED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS VOIDED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_REFUNDED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUSREFUNDED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_FAILED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS FAILED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_CANCELED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS CANCELED", esito: "L’operazione è stata annullata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DENIED_BY_RISK",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DENIED_BY_RISK", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_THREEDS_VALIDATED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS THREEDS_VALIDATED", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_THREEDS_FAILED",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS THREEDS_FAILED", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_100",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 100", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_101",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 101", esito: "C’è un problema con la tua carta" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_102",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 102", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_104",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 104", esito: "I dati della carta non risultano corretti" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_106",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 106", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_109",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 109", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_110",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 110", esito: "I dati della carta non risultano corretti" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_111",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 111", esito: "C’è un problema con la tua carta" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_115",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 115", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_116",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 116", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_117",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 117", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_118",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 118", esito: "I dati della carta non risultano corretti" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_119",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 119", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_120",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 120", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_121",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 121", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_122",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 122", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_123",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 123", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_124",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 124", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_125",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 125", esito: "I dati della carta non risultano corretti" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_126",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 126", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_129",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 129", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_200",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 200", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_202",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 202", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_204",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 204", esito: "Autorizzazione negata" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_208",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 208", esito: "I dati della carta non risultano corretti" }
    ],

    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_209",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 209", esito: "I dati della carta non risultano corretti" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_210",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 210", esito: "I dati della carta non risultano corretti" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_413",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 413", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_888",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 888", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_902",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 902", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_903",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 903", esito: "Autorizzazione negata" }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_904",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 904", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_906",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 906", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_907",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 907", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_908",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 908", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_909",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 909", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_911",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 911", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_913",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 913", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ],
    [
      "AUTHORIZATION_COMPLETED_WITH_NPG_AUTH_STATUS_DECLINED_ERROR_CODE_999",
      { title: "AUTHORIZATION COMPLETED WITH NPG AUTHORIZATION STATUS DECLINED AND ERROR CODE 999", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ]



  ]);


  /**
   * Increase default test timeout (80000ms)
   * to support entire payment flow
    */
  jest.setTimeout(120000);
  jest.retryTimes(0);
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(120000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_OUTCOME_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })


  Array.from(mockFlowWithExpectedResultMap.keys()).forEach(keyFlowId => {
    it(mockFlowWithExpectedResultMap.get(keyFlowId)?.title || "", async () => {
      await page.evaluate(() => {

        //set item into sessionStorage and localStorage for pass the route Guard
        let sessionData =  '{"authToken":"token","clientId":"CHECKOUT","payments":[{"amount":12000,"isAllCCP":false,"paymentToken":"paymentToken1","reason":"reason1","rptId":"77777777777302001751670642100","transferList":[{"digitalStamp":true,"paFiscalCode":"66666666666","transferAmount":100,"transferCategory":"transferCategory1"},{"digitalStamp":false,"paFiscalCode":"77777777777","transferAmount":900,"transferCategory":"transferCategory2"}]}],"status":"ACTIVATED","transactionId":"f4f1b6a82b7d473583b506fcd5edf308"}';
        sessionStorage.setItem('transaction', sessionData);
        localStorage.setItem('transaction', sessionData);
  
      });
      await page.setCookie({name: "mockFlow", value:  keyFlowId});
      await page.goto(CHECKOUT_OUTCOME_URL);
      const resultTitleSelector = "#responsePageMessageTitle";
      const message = await page.waitForSelector(resultTitleSelector);
      const responseMessage = await message.evaluate((el) => el.textContent);
      expect(responseMessage).toContain(mockFlowWithExpectedResultMap.get(keyFlowId)?.esito);
    })
  });

});