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

const HiddenFocusProxy = ({ id }: { id: string }) => (
  <div
    id={`proxy_${id}`}
    style={{
      position: "absolute",
      opacity: 0,
      width: "100%",
      height: "100%",
      zIndex: 3,
      cursor: "vertical-text",
    }}
    tabIndex={0}
  />
);

export function RenderField(props: Props) {
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
    const frameFocus = () => {
      document.getElementById(`frame_${id}`)?.focus();
      setActive(true);
    };
    const frameLoseFocus = () => setActive(false);

    const hiddenFocusProxy = document.getElementById(`proxy_${id}`);

    hiddenFocusProxy?.addEventListener("focus", frameFocus);
    window?.addEventListener("focus", frameLoseFocus);

    return () => {
      hiddenFocusProxy?.removeEventListener("focus", frameFocus);
      window?.removeEventListener("focus", frameLoseFocus);
    };
  }, []);

  return (
    <FormControl sx={styles.formControl}>
      <HiddenFocusProxy id={id} />
      <InputLabel sx={styles.label} margin="dense" shrink>
        {label}
      </InputLabel>
      <Box sx={styles.box}>
        {src && (
          <iframe
            src={src}
            style={styles.iframe}
            id={`frame_${id}`}
            tabIndex={-1}
          />
        )}
      </Box>
      {(errorMessage || errorCode) && (
        <FormHelperText required error>
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
