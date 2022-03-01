/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, SxProps, Typography } from "@mui/material";
import React from "react";

function PspFieldContainer(props: {
  image: string | undefined;
  body: string | number | undefined;
  flexDirection?: "row" | "column";
  bodyVariant?: "body2" | "sidenav";
  sx?: SxProps;
  endAdornment?: React.ReactNode;
  onClick: () => void;
}) {
  const defaultStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    pt: 2,
    pb: 2,
  };

  return (
    <Box sx={{ ...defaultStyle, ...props.sx }} onClick={props.onClick}>
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
          <img
            src={props.image}
            alt="Logo gestore"
            style={{ width: "125px", height: "40px" }}
          />
          <Typography
            variant={props.bodyVariant}
            component={"div"}
            sx={{ mt: 1 }}
          >
            {props.body}
          </Typography>
        </Box>
      </Box>
      {props.endAdornment}
    </Box>
  );
}

PspFieldContainer.defaultProps = {
  flexDirection: "column",
  titleVariant: "body2",
  bodyVariant: "sidenav",
};

export default PspFieldContainer;
