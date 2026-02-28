import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  useTheme,
  Skeleton,
  Theme,
  SxProps,
} from "@mui/material";
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
  isAllFieldsLoaded?: boolean;
}

const getSrcFromFieldsByID = (
  fields: ReadonlyArray<Field>,
  id: keyof typeof IdFields
) => fields.find((field) => field.id === id)?.src;

interface Styles {
  formControl: SxProps<Theme>;
  label: SxProps<Theme>;
  box: SxProps<Theme>;
  iframe: React.CSSProperties;
  skeleton: SxProps<Theme>;
  fieldStatusIcon: React.CSSProperties;
}

export function IframeCardField(props: Props) {
  const {
    fields,
    id,
    errorCode,
    errorMessage,
    label,
    isValid,
    isAllFieldsLoaded,
  } = props;
  const { t } = useTranslation();

  const styles = useStyles(props);

  // function to set SRC to the iframe el avoids firefox back button bug
  const setSrcOnIframe = (src: string) => {
    const iframeEl: HTMLIFrameElement | null = document.getElementById(
      `frame_${id}`
    ) as HTMLIFrameElement;
    iframeEl?.contentWindow?.location.replace(src);
    iframeEl.setAttribute("src", src);
  };

  // Find src based on ID
  const src = fields && id ? getSrcFromFieldsByID(fields, id) : "";

  React.useEffect(() => {
    if (src) {
      setSrcOnIframe(src);
    }
  }, [src]);

  const InnerComponent = (
    <FormControl sx={styles.formControl}>
      <InputLabel
        sx={styles.label}
        aria-hidden={true}
        margin="dense"
        shrink
        htmlFor={id}
        id={label}
      >
        {label}
      </InputLabel>
      <Box sx={styles.box} aria-busy={!isAllFieldsLoaded}>
        <iframe
          aria-label={label + " " + t("inputCardPage.formFields.required")}
          role="textbox"
          id={`frame_${id}`}
          seamless
          style={styles.iframe}
        />
        <Box
          style={styles.fieldStatusIcon}
          role="presentation"
          visibility={isValid === false ? "visible" : "hidden"}
        >
          <ErrorOutlineIcon sx={{ mr: 2.5 }} color="error" />
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

  return (
    <>
      {isAllFieldsLoaded || (
        <Skeleton
          variant="text"
          sx={styles.skeleton}
          aria-busy={true}
          animation="wave"
        />
      )}
      <Box display={isAllFieldsLoaded ? "flex" : "none"}>{InnerComponent}</Box>
    </>
  );
}

const useStyles = (props: Props): Styles => {
  const { style } = props;
  const { palette } = useTheme();
  const borderStyle = useBorderStyles(props);

  return {
    formControl: {
      width: "100%",
      margin: "dense",
      marginY: 3,
      borderRadius: "4px",
      boxShadow: `0 0 0 ${borderStyle.borderWidth} ${borderStyle.boxColor}`,
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
      height: 61,
      width: "100%",
      padding: "1px",
      paddingLeft: 1,
      position: "relative",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: palette.common.white,
      borderRadius: "4px",
    },
    iframe: {
      display: "flex",
      border: "none",
      height: "100%",
      width: "100%",
      justifyContent: "center",
      ...(style || {}),
    },
    skeleton: {
      display: "flex",
      width: "100%",
      maxWidth: "100%",
      cursor: "progress",
      height: "108px",
    },
    fieldStatusIcon: {
      display: "flex",
      position: "absolute",
      alignItems: "center",
      width: "10%",
      justifySelf: "flex-end",
      cursor: "initial",
      right: 0,
    },
  };
};

// Function to calculate border styles based on validity and active focus
const useBorderStyles = ({ isValid, activeField, id }: Props) => {
  const { palette } = useTheme();
  const errorColor = palette.error.dark;
  const focusColor = palette.primary.main;

  if (isValid === false) {
    return {
      labelColor: errorColor,
      boxColor: errorColor,
      borderWidth: activeField === id ? "2px" : "1px",
      hoverShadowWidth: "2px",
      hoverShadowColor: errorColor,
    };
  }

  // Styles for active focus
  if (activeField === id) {
    return {
      labelColor: focusColor,
      boxColor: focusColor,
      borderWidth: "2px",
      hoverShadowWidth: "2px",
      hoverShadowColor: focusColor,
    };
  }

  // Inactive focus
  return {
    labelColor: palette.text.secondary,
    boxColor: palette.grey[500],
    borderWidth: "1px",
    hoverShadowWidth: "1px",
    hoverShadowColor: palette.text.primary,
  };
};
