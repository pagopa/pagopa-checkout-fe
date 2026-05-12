
import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { selectLanguage } from "./utils/helpers";
import { URL } from "./utils/testConstants";

jest.setTimeout(60000);
jest.retryTimes(1);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().endsWith(URL.FEATURE_FLAG_PATH)) {
      request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
           {
            isAuthenticationEnabled: true,
            isMaintenancePageEnabled: true,
            isPspPickerPageEnabled: true,
            isPaymentWalletEnabled: true,
          },
        ),
      });
    } else {
      request.continue();
    }
  });
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1200, height: 907 });
});

describe("Maintenance mode language tests", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])("Should display maintenance message correctly in [%s]", async (_lang, translation) => {
   
    await selectLanguage(_lang);
    await page.waitForSelector("#id_maintenance", { visible: true, timeout: 5000 });
    const title = await page.$eval("#id_maintenance", el => el.textContent?.trim() || "");
    expect(title).toContain(translation.maintenancePage.title);
  });

  
  it("Should redirect to status page on button click in [%s]", async () => { 
    await page.waitForSelector("#id_button_redirect", { visible: true, timeout: 5000 });    
    await Promise.all([
      page.click("#id_button_redirect"),
      page.waitForNavigation({ timeout: 5000 })
    ]);    
    expect(page.url()).toContain(URL.SITE_URL);
  });
});