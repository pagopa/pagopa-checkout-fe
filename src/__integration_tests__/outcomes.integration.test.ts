import itTranslation from "../translations/it/translations.json";
import { payNotice, selectLanguage } from "./utils/helpers";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
    number: "4333334000098346",
    expirationDate: "1230",
    ccv: "123",
    holderName: "Mario Rossi",
};
const VALID_NOTICE_CODE = "302016723749670000";
const OUTCOME_FISCAL_CODE_SUCCESS = "77777777000";
const OUTCOME_FISCAL_CODE_GENERIC_ERROR = "77777777001";
const OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR = "77777777002";
const OUTCOME_FISCAL_CODE_INVALID_DATA = "77777777003";
const OUTCOME_FISCAL_CODE_TIMEOUT = "77777777004";
const OUTCOME_FISCAL_CODE_INVALID_CARD = "77777777007";
const OUTCOME_FISCAL_CODE_CANCELLED_BY_USER = "77777777008";
const OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT = "77777777010";
const OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE = "77777777017";
const OUTCOME_FISCAL_CODE_REFUNDED = "77777777018";
const OUTCOME_FISCAL_CODE_PSP_ERROR = "77777777025";
const OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE = "77777777116";
const OUTCOME_FISCAL_CODE_CVV_ERROR = "77777777117";
const OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED = "77777777121";
const OUTCOME_FISCAL_CODE_DEFAULT = "77777777777";

jest.setTimeout(60000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
    // Listen for dialog events and automatically accept them after a delay
    page.on('dialog', async dialog => {
        if (dialog.type() === 'beforeunload') {
            try {
                // Wait for few seconds before accepting the dialog
                await new Promise(resolve => setTimeout(resolve, 2000));
                await dialog.accept();
            } catch (error) {
                console.log('Dialog is already accepted.');
            }
        }
    });
});

describe("Transaction outcome success tests", () => {
    it("should show success outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_SUCCESS} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_SUCCESS,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        )
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));
    });
});

describe("Transaction outcome generic-error tests", () => {
    it("should show generic-error outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_GENERIC_ERROR} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_GENERIC_ERROR,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[1].title);
    });
});

describe("Transaction outcome authorization-error tests", () => {
    it("should show authorization-error outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[2].title);
    }
    );
});

describe("Transaction outcome invalid-data tests", () => {
    it("should show invalid-data outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_INVALID_DATA} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_INVALID_DATA,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[3].title);
    });
});

describe("Transaction outcome timeout tests", () => {
    it("should show timeout outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_TIMEOUT} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_TIMEOUT,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[4].title);
    });
});

describe("Transaction outcome invalid-card tests", () => {
    it("should show invalid-card outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_INVALID_CARD} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_INVALID_CARD,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[7].title);
    });
});

describe("Transaction outcome cancelled-by-user tests", () => {
    it("should show cancelled-by-user outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_CANCELLED_BY_USER} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_CANCELLED_BY_USER,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[8].title);
    }
    );
});

describe("Transaction outcome excessive-amount tests", () => {
    it("should show excessive-amount outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[10].title);
    }
    );
});

describe("Transaction outcome taken-in-charge tests", () => {
    it("should show taken-in-charge outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[17].title);
    }
    );
});

describe("Transaction outcome refunded tests", () => {
    it("should show refunded outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_REFUNDED} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_REFUNDED,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[18].title);
    });
});

describe("Transaction outcome psp-error tests", () => {
    it("should show psp-error outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_PSP_ERROR} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_PSP_ERROR,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[25].title);
    });
});

describe("Transaction outcome balance-not-available tests", () => {
    it("should show balance-not-available outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[116].title);
    }
    );
});

describe("Transaction outcome cvv-error tests", () => {
    it("should show cvv-error outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_CVV_ERROR} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_CVV_ERROR,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[117].title);
    });
});

describe("Transaction outcome limit-exceeded tests", () => {
    it("should show limit-exceeded outcome ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[121].title);
    }
    );
});

describe("Transaction outcome fallback tests", () => {
    it("should fallback to success for unmapped code ", async() => {
        console.log(`Testing outcome for fiscal code: ${OUTCOME_FISCAL_CODE_DEFAULT} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_DEFAULT,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        );
        expect(resultMessage).toContain(
            itTranslation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\u00A0€")
        );
    }
    );
});
