/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, ButtonBase, SxProps, Theme, Typography } from "@mui/material";
import React from "react";

function PspFieldContainer(props: {
  image: string | undefined;
  body: string | number | undefined;
  flexDirection?: "row" | "column";
  bodyVariant?: "body2" | "sidenav";
  sx?: SxProps<Theme>;
  endAdornment?: React.ReactNode;
  onClick: () => void;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) {
  const defaultStyle: SxProps<Theme> = {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    pt: 2,
    pb: 2,
    textAlign: "left",
    "&.Mui-focusVisible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "2px",
    },
    ...props.sx,
  };

  return (
    <ButtonBase
      id={props.id}
      sx={defaultStyle}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledBy}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          gap: 3,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: props.flexDirection,
          }}
        >
          <Box sx={{ paddingRight: "10px" }}>
            <img
              alt={`Logo ${props.body}`}
              aria-hidden="true"
              src={props.image}
              style={{ maxHeight: "20px", width: "auto", maxWidth: "100%" }}
            />
          </Box>
          <Typography
            className="pspFeeName"
            variant={props.bodyVariant}
            component={"div"}
            sx={{ mt: 1 }}
            style={{ marginRight: "8px" }}
          >
            {props.body}
          </Typography>
        </Box>
      </Box>
      {props.endAdornment}
    </ButtonBase>
  );
}

PspFieldContainer.defaultProps = {
  flexDirection: "column",
  titleVariant: "body2",
  bodyVariant: "sidenav",
};

export default PspFieldContainer;
