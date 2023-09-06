import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  useTheme,
} from "@mui/material";
import { SxProps } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Field } from "../../../../../generated/definitions/payment-ecommerce/Field";
import { IdFields } from "./types";

interface Props {
  label: string;
  fields?: ReadonlyArray<Field>;
  id?: keyof typeof IdFields;
  style?: React.CSSProperties;
  errorCode?: string | null;
  errorMessage?: string | null;
  isValid?: boolean;
}

const getSrcFromFieldsByID = (
  fields: ReadonlyArray<Field>,
  id: keyof typeof IdFields
) => fields.find((field) => field.id === id)?.src;

interface Styles {
  formControl: SxProps;
  label: SxProps;
  box: SxProps;
  iframe: React.CSSProperties;
}

const HiddenFocusProxy = ({ id, active }: { id: string; active: boolean }) => (
  <div
    id={`proxy_${id}`}
    aria-hidden
    tabIndex={active ? -1 : 1}
    style={{
      position: "absolute",
      opacity: 0,
      width: "100%",
      height: "100%",
      zIndex: 3,
      cursor: "text",
    }}
  />
);

export function IframeCardField(props: Props) {
  if (!props.fields || !props.id) {
    return <Box />;
  }

  const [active, setActive] = useState<boolean>(false);

  const { fields, id, errorCode, errorMessage, label } = props;
  const { t } = useTranslation();
  const styles = useStyles(props, active);

  // Find src based on ID
  const src = getSrcFromFieldsByID(fields, id);
  if (!src) {
    return <Box />;
  }

  // Adding focus and blur event listeners for focus management
  useEffect(() => {
    const hiddenFocusProxy = document.getElementById(`proxy_${id}`);

    const frameFocus = () => {
      setActive(false);
      document.getElementById(`frame_${id}`)?.focus();
      setActive(true);
    };

    const windowFocus = () => {
      setActive(false);
    };

    hiddenFocusProxy?.addEventListener("focus", frameFocus);
    window?.addEventListener("focus", windowFocus);

    return () => {
      hiddenFocusProxy?.removeEventListener("focus", frameFocus);
      window?.removeEventListener("focus", windowFocus);
    };
  }, []);

  return (
    <FormControl sx={styles.formControl}>
      <HiddenFocusProxy id={id} active={active} />
      <InputLabel
        sx={styles.label}
        margin="dense"
        shrink
        htmlFor={`frame_${id}`}
      >
        {label}
      </InputLabel>
      <Box sx={styles.box}>
        {src && (
          <iframe
            src={src}
            style={styles.iframe}
            id={`frame_${id}`}
            title={label}
            tabIndex={-1}
          />
        )}
      </Box>
      {(errorMessage || errorCode) && (
        <FormHelperText
          required
          error
          id={`frame_${id}_hint`}
          aria-hidden={!errorMessage}
          aria-live="assertive"
        >
          {t(`errorMessageNPG.${errorCode}`, {
            defaultValue: errorMessage,
          })}
        </FormHelperText>
      )}
    </FormControl>
  );
}

const useStyles = (props: Props, active: boolean | undefined): Styles => {
  const { style } = props;
  const borderStyle = useBorderStyles(props, active);

  return {
    formControl: {
      width: "100%",
      margin: "dense",
      marginY: 3,
      borderRadius: "4px",
      boxShadow: `0 0 0 1px ${borderStyle.boxColor}`,
      transition: "box-shadow 0.1s ease-in",
      "&:hover": {
        boxShadow: `0 0 0 ${borderStyle.hoverShadowWidth} ${borderStyle.hoverShadowColor}`,
      },
    },
    label: {
      background: "#fff",
      paddingX: 1,
      color: borderStyle.labelColor,
    },
    box: {
      padding: 2,
      position: "relative",
    },
    iframe: {
      display: "block",
      border: "none",
      height: "30px",
      width: "100%",
      ...(style || {}),
    },
  };
};

// Function to calculate border styles based on validity and active focus
const useBorderStyles = ({ isValid }: Props, active: boolean | undefined) => {
  const { palette } = useTheme();
  const errorColor = palette.error.dark;
  const focusColor = palette.primary.main;

  // Styles for active focus
  if (active) {
    return {
      labelColor: focusColor,
      boxColor: focusColor,
      hoverShadowWidth: "2px",
      hoverShadowColor: focusColor,
    };
  }

  // Default styles for neutral state or undefined validity
  if (isValid === undefined) {
    return {
      labelColor: palette.text.secondary,
      boxColor: palette.grey[500],
      hoverShadowWidth: "1px",
      hoverShadowColor: palette.text.primary,
    };
  }

  // Inactive focus
  return {
    labelColor: isValid ? palette.text.secondary : errorColor,
    boxColor: isValid ? palette.grey[500] : errorColor,
    hoverShadowWidth: "1px",
    hoverShadowColor: palette.text.primary,
  };
};
