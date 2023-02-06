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
