import { Box, FormControl, FormHelperText, InputLabel } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
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

export function RenderField(props: Props) {
  if (!props.fields) {
    return <Box></Box>;
  }
  if (!props.id) {
    return <Box></Box>;
  }

  const { fields, id, errorCode, errorMessage, label } = props;
  const { t } = useTranslation();
  const styles = useStyles(props);

  // Find src based on ID
  const src = getSrcFromFieldsByID(fields, id);
  if (!src) {
    return <Box></Box>;
  }

  return (
    <FormControl sx={styles.formControl}>
      {/* Input label */}
      <InputLabel sx={styles.label} margin="dense" shrink>
        {label}
      </InputLabel>
      {/* Box with embedded content */}
      <Box sx={styles.box}>
        {src && <iframe src={src} style={styles.iframe} />}
      </Box>
      {/* Error message or code */}
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

const COLORS = {
  LABEL: "#5c6f82",
  BOX: "#c4c4c4",
  VALID: "#0073e6",
  INVALID: "#d85757",
  HOVER: "#17324D",
};

// Function to calculate border styles based on validity
const borderStyles = (isValid: boolean | undefined) => {
  // If validity is defined, determine colors for valid or invalid state
  if (isValid !== undefined) {
    const validityColor = isValid ? COLORS.VALID : COLORS.INVALID;
    return {
      labelColor: validityColor,
      boxColor: validityColor,
      hoverShadowWidth: "2px",
      hoverShadowColor: validityColor,
    };
  }

  // Default styles for undefined validity (neutral state)
  return {
    labelColor: COLORS.LABEL,
    boxColor: COLORS.BOX,
    hoverShadowWidth: "1px",
    hoverShadowColor: COLORS.HOVER,
  };
};

const useStyles = ({ isValid, style }: Props): Styles => {
  const borderStyle = borderStyles(isValid);

  return {
    formControl: {
      width: "100%",
      margin: "dense",
      marginY: 3,
    },
    label: {
      background: "#fff",
      paddingX: 1,
      color: borderStyle.labelColor,
    },
    box: {
      borderRadius: "4px",
      padding: 2,
      position: "relative",
      boxShadow: `0 0 0 1px ${borderStyle.boxColor}`,
      transition: "box-shadow 0.1s ease-in",
      "&:hover": {
        boxShadow: `0 0 0 ${borderStyle.hoverShadowWidth} ${borderStyle.hoverShadowColor}`,
      },
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
