import React from "react";
import { Box, FormControl, FormHelperText, InputLabel } from "@mui/material";
import { useTranslation } from "react-i18next";
import { IdFields } from "./IframeCardForm";

export interface Field {
  type: string;
  id: string;
  src: string;
  class: string;
}
interface Props {
  label: string;
  fields?: Array<Field>;
  id?: IdFields;
  style?: React.CSSProperties;
  helperMessage?: string | udefined;
}

const getSrcFromFieldsByID = (fields: Array<Field>, id: IdFields) =>
  fields.find((field) => field.id === id)?.src;

export function RenderField(props: Props) {
  if (!props.fields) {
    return <Box></Box>;
  }
  if (!props.id) {
    return <Box></Box>;
  }
  const src = getSrcFromFieldsByID(props.fields, props.id);
  if (!src) {
    return <Box></Box>;
  }

  const { t } = useTranslation();

  return (
    <>
      <FormControl fullWidth={true} margin="dense" sx={{ marginY: 3 }}>
        <InputLabel
          margin="dense"
          shrink={true}
          sx={{
            background: "#fff",
            paddingX: 1,
          }}
        >
          {props.label}
        </InputLabel>
        <Box
          sx={{
            borderRadius: 1,
            padding: 2,
            borderColor: "grey.400",
            borderStyle: "solid",
            borderWidth: "1px",
            position: "relative",
          }}
        >
          <iframe
            src={src}
            style={{
              display: "block",
              border: "none",
              height: 30,
              width: "100%",
              ...props.style,
            }}
          />
        </Box>
        {props.helperMessage && (
          <FormHelperText required={true}>{props.helperMessage}</FormHelperText>
        )}
      </FormControl>
    </>
  );
}
