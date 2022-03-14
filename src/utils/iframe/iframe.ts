import {
  THREEDSACSCHALLENGEURL_STEP2_REQ,
  THREEDSMETHODURL_STEP1_REQ,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { onBrowserUnload } from "../eventListeners";

function createForm(
  formName: string,
  formAction: string,
  formTarget: string,
  inputs: any
) {
  const form: HTMLFormElement = Object.assign(document.createElement("form"), {
    name: formName,
    action: formAction,
    method: "POST",
    target: formTarget,
  });

  form.setAttribute("style", "display:none");
  for (const [name, value] of Object.entries(inputs)) {
    form.appendChild(
      Object.assign(document.createElement("input"), {
        name,
        value,
      })
    );
  }

  return form;
}

export function createIFrame(container: any, id: string, name: string) {
  const iframe = document.createElement("iframe");

  iframe.setAttribute("id", id);
  iframe.setAttribute("name", name);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("border", "0");
  iframe.setAttribute("style", "overflow:hidden; position:absolute");

  container.appendChild(iframe);

  return iframe;
}

export function start3DS2MethodStep(
  threeDSMethodUrl: any,
  threeDSMethodData: any,
  myIFrame: any
) {
  // container should be an iframe
  mixpanel.track(THREEDSMETHODURL_STEP1_REQ.value, {
    EVENT_ID: THREEDSMETHODURL_STEP1_REQ.value,
  });
  const html = document.createElement("html");
  const body = document.createElement("body");
  const form = createForm(
    "threeDSMethodForm",
    threeDSMethodUrl,
    myIFrame.name,
    {
      threeDSMethodData,
    }
  );

  body.appendChild(form);
  html.appendChild(body);
  myIFrame.appendChild(html);
  myIFrame.setAttribute("style", "display:none");

  form.submit();

  return myIFrame;
}

export function start3DS2AcsChallengeStep(
  acsUrl: any,
  params: any,
  container: any
) {
  mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_REQ.value, {
    EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_REQ.value,
    acsUrl,
  });
  window.removeEventListener("beforeunload", onBrowserUnload);
  const form = createForm("acsChallengeForm", acsUrl, "_self", params);
  container.appendChild(form);
  form.submit();
}
