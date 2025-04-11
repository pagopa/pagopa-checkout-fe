import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getReCaptchaKey } from "../../../storage/sessionStorage";
import { callRecaptcha } from "../../../api/helpers/recaptchaHelper";

jest.mock("../../../storage/sessionStorage", () => ({
  getReCaptchaKey: jest.fn(),
}));

jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      executeAsync: jest.fn(() => "token-value"),
    }));
    return <div ref={ref as React.Ref<HTMLDivElement>} />;
  }),
}));

const RecaptchaWrapper = React.forwardRef(
  (_props, ref: React.Ref<ReCAPTCHA>) => (
    <MemoryRouter>
      <ReCAPTCHA ref={ref} sitekey={getReCaptchaKey() as string} />
    </MemoryRouter>
  )
);

afterEach(() => {
  jest.resetAllMocks();
});

describe("Recaptcha helper test", () => {
  it("Should return recaptcha token correctly", async () => {
    const recaptchaRef = React.createRef<ReCAPTCHA>();
    render(<RecaptchaWrapper ref={recaptchaRef} />);

    if (recaptchaRef.current) {
      const token = await callRecaptcha(recaptchaRef.current, true);
      expect(token).toEqual("token-value");
    }
    expect(recaptchaRef.current).toBeDefined();
  });

  it("Should return empty token if error occurs", async () => {
    const recaptchaRef = React.createRef<ReCAPTCHA>();

    render(<RecaptchaWrapper ref={recaptchaRef} />);

    if (recaptchaRef.current) {
      (recaptchaRef.current.executeAsync as jest.Mock).mockReturnValue(null);
      const token = await callRecaptcha(recaptchaRef.current, true);
      expect(token).toEqual("");
    }
    expect(recaptchaRef.current).toBeDefined();
  });
});
