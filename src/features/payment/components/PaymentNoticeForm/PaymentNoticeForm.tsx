/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Box, InputAdornment } from "@mui/material";
import { Formik, FormikProps, useFormikContext } from "formik";
import React from "react";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import TextFormField from "../../../../components/TextFormField/TextFormField";
import { cleanSpaces } from "../../../../utils/form/formatters";
import { getFormValidationIcon } from "../../../../utils/form/validators";
import { PaymentFormFields } from "../../models/paymentModel";

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

export function PaymentNoticeForm(props: {
  defaultValues?: PaymentFormFields;
  onCancel: () => void;
  onSubmit: (notice: PaymentFormFields) => void;
  loading: boolean;
}) {
  const formRef = React.useRef<FormikProps<PaymentFormFields>>(null);

  const validate = (values: PaymentFormFields) => ({
    ...(values.billCode
      ? {
          ...(/\b^\d{18}$\b/.test(values.billCode)
            ? {}
            : { billCode: "paymentNoticePage.formErrors.minCode" }),
        }
      : { billCode: "paymentNoticePage.formErrors.required" }),
    ...(values.cf
      ? {
          ...(/\b^\d{11}$\b/.test(values.cf)
            ? {}
            : { cf: "paymentNoticePage.formErrors.minCf" }),
        }
      : { cf: "paymentNoticePage.formErrors.required" }),
  });

  return (
    <>
      <Formik
        innerRef={formRef}
        initialValues={
          props.defaultValues || {
            billCode: "",
            cf: "",
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
          <form onSubmit={handleSubmit} data-testid="paymentNoticeForm-form">
            <FocusError />
            <Box>
              <TextFormField
                required
                fullWidth
                variant="outlined"
                errorText={errors.billCode}
                error={!!(errors.billCode && touched.billCode)}
                label="paymentNoticePage.formFields.billCode"
                id="billCode"
                type="text"
                inputMode="numeric"
                value={values.billCode}
                handleChange={(e) => {
                  e.currentTarget.value = cleanSpaces(e.currentTarget.value);
                  handleChange(e);
                }}
                handleBlur={handleBlur}
                sx={{ mb: 4 }}
                endAdornment={
                  <InputAdornment position="end">
                    {getFormValidationIcon(
                      !!values.billCode,
                      !!errors.billCode
                    )}
                  </InputAdornment>
                }
              />
              <TextFormField
                required
                fullWidth
                variant="outlined"
                errorText={errors.cf}
                error={Boolean(errors.cf && touched.cf)}
                label="paymentNoticePage.formFields.cf"
                id="cf"
                type="text"
                inputMode="numeric"
                value={values.cf}
                handleChange={(e) => {
                  e.currentTarget.value = cleanSpaces(e.currentTarget.value);
                  handleChange(e);
                }}
                handleBlur={handleBlur}
                endAdornment={
                  <InputAdornment position="end">
                    {getFormValidationIcon(!!values.cf, !!errors.cf)}
                  </InputAdornment>
                }
              />
            </Box>
            <FormButtons
              type="submit"
              submitTitle="paymentNoticePage.formButtons.submit"
              cancelTitle="paymentNoticePage.formButtons.cancel"
              idCancel="paymentNoticeButtonCancel"
              idSubmit="paymentNoticeButtonContinue"
              disabledSubmit={false}
              loadingSubmit={props.loading}
              handleSubmit={() => handleSubmit()}
              handleCancel={props.onCancel}
            />
          </form>
        )}
      </Formik>
    </>
  );
}
