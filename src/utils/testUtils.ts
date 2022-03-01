import axios from "axios";
import { launch } from "puppeteer";

export async function getIdPayment(
  pmControlHost: string,
  pmControlPort: string
) {
  const myBrowser = await launch({ headless: true });
  const page = await myBrowser.newPage();
  await page.goto(
    `http://${pmControlHost}:${pmControlPort}/pa/payment/gen/nodo`
  );
  const myButtonSelector = "body #copyIdPayment";
  await page.waitForSelector(myButtonSelector);

  const [serverRes] = await Promise.all([
    page.waitForResponse((response) => response.request().method() === "PUT"),
    await page.click(myButtonSelector),
  ]);

  const myJson = (await serverRes.json()) as Record<string, string>;
  const idPayment = myJson.sessionId;

  await myBrowser.close();
  return idPayment;
}

export async function getIdPaymentMock(pmMockHost: string, pmMockPort: string) {
  return (await axios.get(`http://${pmMockHost}:${pmMockPort}/getPaymentId`))
    .data.idPayment;
}

export async function setMethodChallengeSteps(
  pmControlHost: string,
  pmControlPort: string
) {
  const myBrowser = await launch({ headless: true });
  const page = await myBrowser.newPage();
  await page.goto(
    `http://${pmControlHost}:${pmControlPort}/3ds2.0-manager/home`
  );

  await page.waitForSelector(".row #step0");
  await page.click(".row #step0");

  await page.waitForSelector(
    ".container > .row:nth-child(2) > .form-inline > .form-group > .btn"
  );
  await page.click(
    ".container > .row:nth-child(2) > .form-inline > .form-group > .btn"
  );

  await page.waitForSelector(".form-inline > #fieldsetStep1 #step1");
  await page.click(".form-inline > #fieldsetStep1 #step1");

  await page.waitForSelector(
    ".row > .form-inline > #fieldsetStep1 > .form-group > .btn"
  );
  await page.click(".row > .form-inline > #fieldsetStep1 > .form-group > .btn");

  await myBrowser.close();
}
