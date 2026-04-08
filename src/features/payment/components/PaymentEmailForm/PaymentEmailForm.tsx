/* eslint-disable @typescript-eslint/no-empty-function */

import { Box, InputAdornment } from "@mui/material";
import { Formik, FormikProps, useFormikContext } from "formik";
import React from "react";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import TextFormField from "../../../../components/TextFormField/TextFormField";
import { getFormErrorIcon } from "../../../../utils/form/validators";
import { emailValidation } from "../../../../utils/regex/validators";
import { PaymentEmailFormFields } from "../../models/paymentModel";

const FocusError = () => {
  const { errors, submitCount, isSubmitting, isValidating } =
    useFormikContext();
  const [lastFocusSubmitCount, setLastFocusSubmitCount] = React.useState(0);

  React.useEffect(() => {
    if (submitCount > lastFocusSubmitCount && !isSubmitting && !isValidating) {
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const selector = errorKeys.map((key) => `[name="${key}"]`).join(",");
        const firstErrorElement = document.querySelector(
          selector
        ) as HTMLElement;
        if (firstErrorElement) {
          firstErrorElement.focus();
        }
      }
      setLastFocusSubmitCount(submitCount);
    }
  }, [submitCount, isSubmitting, isValidating, errors, lastFocusSubmitCount]);

  return null;
};

export function PaymentEmailForm(props: {
  defaultValues?: PaymentEmailFormFields;
  onCancel: () => void;
  onSubmit: (emailInfo: PaymentEmailFormFields) => void;
}) {
  const formRef = React.useRef<FormikProps<PaymentEmailFormFields>>(null);

  const validate = (values: PaymentEmailFormFields) => ({
    ...(values.email
      ? {
          ...(emailValidation(values.email)
            ? {}
            : { email: "paymentEmailPage.formErrors.invalid" }),
        }
      : { email: "paymentEmailPage.formErrors.required" }),
    ...(values.confirmEmail
      ? {
          ...(emailValidation(values.confirmEmail)
            ? {
                ...(values.email === values.confirmEmail
                  ? {}
                  : { confirmEmail: "paymentEmailPage.formErrors.notEqual" }),
              }
            : { confirmEmail: "paymentEmailPage.formErrors.invalid" }),
        }
      : { confirmEmail: "paymentEmailPage.formErrors.required" }),
  });

  return (
    <>
      <Formik
        innerRef={formRef}
        initialValues={
          props.defaultValues || {
            email: "",
            confirmEmail: "",
          }
        }
        validate={validate}
        onSubmit={props.onSubmit}
      >
        {({
          touched,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          values,
        }) => (
          <form onSubmit={handleSubmit}>
            <FocusError />
            <Box>
              <TextFormField
                required
                fullWidth
                variant="outlined"
                errorText={errors.email}
                error={!!(errors.email && touched.email)}
                label="paymentEmailPage.formFields.email"
                id="email"
                type="email"
                value={values.email}
                handleChange={handleChange}
                handleBlur={handleBlur}
                sx={{ mb: 4 }}
                endAdornment={
                  <InputAdornment position="end">
                    {getFormErrorIcon(!!values.email, !!errors.email)}
                  </InputAdornment>
                }
              />
              <TextFormField
                required
                fullWidth
                variant="outlined"
                errorText={errors.confirmEmail}
                error={Boolean(errors.confirmEmail && touched.confirmEmail)}
                label="paymentEmailPage.formFields.confirmEmail"
                id="confirmEmail"
                type="email"
                value={values.confirmEmail}
                handleChange={handleChange}
                handleBlur={handleBlur}
                endAdornment={
                  <InputAdornment position="end">
                    {getFormErrorIcon(
                      !!values.confirmEmail,
                      !!errors.confirmEmail
                    )}
                  </InputAdornment>
                }
              />
            </Box>
            <FormButtons
              type="submit"
              submitTitle="paymentEmailPage.formButtons.submit"
              cancelTitle="paymentEmailPage.formButtons.back"
              idSubmit="paymentEmailPageButtonContinue"
              disabledSubmit={false}
              handleSubmit={() => handleSubmit()}
              handleCancel={props.onCancel}
            />
          </form>
        )}
      </Formik>
    </>
  );
}
