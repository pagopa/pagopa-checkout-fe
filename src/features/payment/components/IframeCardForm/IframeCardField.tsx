import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  useTheme,
} from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "../../../../../generated/definitions/payment-ecommerce/Field";
import { FieldId, IdFields } from "./types";

interface Props {
  label: string;
  fields?: ReadonlyArray<Field>;
  id?: keyof typeof IdFields;
  style?: React.CSSProperties;
  errorCode?: string | null;
  errorMessage?: string | null;
  isValid?: boolean;
  activeField: FieldId | undefined;
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
  fieldStatusIcon: React.CSSProperties;
}

export function IframeCardField(props: Props) {
  if (!props.fields || !props.id) {
    return <Box />;
  }

  const { fields, id, errorCode, errorMessage, label, isValid } = props;
  const { t } = useTranslation();
  const styles = useStyles(props);

  // Find src based on ID
  const src = getSrcFromFieldsByID(fields, id);
  if (!src) {
    return <Box />;
  }

  return (
    <FormControl sx={styles.formControl}>
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
          <Box width={1}>
            <iframe
              src={src}
              style={styles.iframe}
              id={`frame_${id}`}
              title={label}
            />
          </Box>
        )}
        <Box
          style={styles.fieldStatusIcon}
          aria-role="presentation"
          visibility={isValid === false ? "visible" : "hidden"}
        >
          <ErrorOutlineIcon sx={{ mr: 1 }} color="error" />
        </Box>
      </Box>
      {(errorMessage || errorCode) && (
        <FormHelperText
          required
          error
          id={`frame_${id}_hint`}
          aria-hidden={isValid}
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

const useStyles = (props: Props): Styles => {
  const { style } = props;
  const borderStyle = useBorderStyles(props);

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
      display: "flex",
      flexDirection: "row",
    },
    iframe: {
      display: "block",
      border: "none",
      height: "30px",
      width: "100%",
      ...(style || {}),
    },
    fieldStatusIcon: {
      display: "flex",
      alignItems: "center",
      width: "10%",
      justifyContent: "flex-end",
    },
  };
};

// Function to calculate border styles based on validity and active focus
const useBorderStyles = ({ isValid, activeField, id }: Props) => {
  const { palette } = useTheme();
  const errorColor = palette.error.dark;
  const focusColor = palette.primary.main;

  // Default styles for neutral state or undefined validity
  if (activeField === undefined || isValid === undefined) {
    return {
      labelColor: palette.text.secondary,
      boxColor: palette.grey[500],
      hoverShadowWidth: "1px",
      hoverShadowColor: palette.text.primary,
    };
  }

  // Styles for active focus
  if (activeField === id) {
    return {
      labelColor: focusColor,
      boxColor: focusColor,
      hoverShadowWidth: "2px",
      hoverShadowColor: focusColor,
    };
  }

  // Inactive focus
  return {
    labelColor: isValid ? palette.text.secondary : errorColor,
    boxColor: isValid ? palette.grey[500] : errorColor,
    hoverShadowWidth: "1px",
    hoverShadowColor: isValid ? palette.text.primary : errorColor,
  };
};
