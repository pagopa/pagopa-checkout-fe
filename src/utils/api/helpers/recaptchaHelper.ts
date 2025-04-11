import ReCAPTCHA from "react-google-recaptcha";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";

export const callRecaptcha = async (
  recaptchaInstance: ReCAPTCHA,
  reset = false
) => {
  if (reset) {
    void recaptchaInstance.reset();
  }
  const recaptchaResponse = await recaptchaInstance.executeAsync();
  return pipe(
    recaptchaResponse,
    O.fromNullable,
    O.getOrElse(() => "")
  );
};
