/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, SxProps, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

function FieldContainer(props: {
  title: string;
  body: string | number;
  icon?: React.ReactNode;
  flexDirection?: "row" | "column";
  titleVariant?: "body2" | "sidenav";
  bodyVariant?: "body2" | "sidenav";
  sx?: SxProps;
  endAdornment?: React.ReactNode;
}) {
  const { t } = useTranslation();
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
    <Box sx={{ ...defaultStyle, ...props.sx }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          gap: 3,
          width: "100%",
        }}
      >
        {props.icon}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: props.flexDirection,
          }}
        >
          <Typography variant={props.titleVariant} component={"div"}>
            {t(props.title)}
          </Typography>
          <Typography variant={props.bodyVariant} component={"div"}>
            {props.body}
          </Typography>
        </Box>
      </Box>
      {props.endAdornment}
    </Box>
  );
}

FieldContainer.defaultProps = {
  flexDirection: "column",
  titleVariant: "body2",
  bodyVariant: "sidenav",
};

export default FieldContainer;
