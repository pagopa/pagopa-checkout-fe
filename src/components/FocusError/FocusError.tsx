import React from "react";
import { useFormikContext } from "formik";

/**
 * A Formik helper component that automatically focuses the first
 * field with a validation error after a form submission attempt.
 * Must be rendered inside a <Formik> context.
 */
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

export default FocusError;
