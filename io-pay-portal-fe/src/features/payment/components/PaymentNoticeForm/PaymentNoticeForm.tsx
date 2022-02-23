/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Box, InputAdornment } from "@mui/material";
import { Formik, FormikProps } from "formik";
import React from "react";
import { FormButtons } from "../../../../components/FormButtons/FormButtons";
import TextFormField from "../../../../components/TextFormField/TextFormField";
import { cleanSpaces } from "../../../../utils/form/formatters";
import { getFormErrorIcon } from "../../../../utils/form/formValidation";
import {
  PaymentFormErrors,
  PaymentFormFields,
} from "../../models/paymentModel";

export function PaymentNoticeForm(props: {
  defaultValues?: PaymentFormFields;
  onCancel: () => void;
  onSubmit: (notice: PaymentFormFields) => void;
  loading: boolean;
}) {
  const formRef = React.useRef<FormikProps<PaymentFormFields>>(null);
  const [disabled, setDisabled] = React.useState(!props.defaultValues?.cf);

  const validate = (values: PaymentFormFields) => {
    const errors: PaymentFormErrors = {
      ...(values.billCode
        ? {
            ...(/\b\d{18}\b/.test(values.billCode)
              ? {}
              : { billCode: "paymentNoticePage.formErrors.minCode" }),
          }
        : { billCode: "paymentNoticePage.formErrors.required" }),
      ...(values.cf
        ? {
            ...(/\b\d{11}\b/.test(values.cf)
              ? {}
              : { cf: "paymentNoticePage.formErrors.minCf" }),
          }
        : { cf: "paymentNoticePage.formErrors.required" }),
    };

    setDisabled(!!(errors.billCode || errors.cf));

    return errors;
  };

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
          <form onSubmit={handleSubmit}>
            <Box>
              <TextFormField
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
                    {getFormErrorIcon(!!values.billCode, !!errors.billCode)}
                  </InputAdornment>
                }
              />
              <TextFormField
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
                    {getFormErrorIcon(!!values.cf, !!errors.cf)}
                  </InputAdornment>
                }
              />
            </Box>
            <FormButtons
              submitTitle="paymentNoticePage.formButtons.submit"
              cancelTitle="paymentNoticePage.formButtons.cancel"
              disabled={disabled}
              loading={props.loading}
              handleSubmit={() => handleSubmit()}
              handleCancel={props.onCancel}
            />
          </form>
        )}
      </Formik>
    </>
  );
}
