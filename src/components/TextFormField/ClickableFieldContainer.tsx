/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, Skeleton, Typography, useTheme } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
function ClickableFieldContainer(props: {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  sx?: SxProps;
  itemSx?: SxProps;
  variant?: "body2" | "sidenav";
  disabled?: boolean;
  loading?: boolean;
  dataTestId?: string;
  dataTestLabel?: string;
}) {
  const theme = useTheme();
  const defaultStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: !props.loading && props.clickable ? "pointer" : "auto",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    pt: 3,
    pb: 3,
    ...props.sx,
  };

  const handleClick = () => {
    if (!props.disabled && props.onClick) {
      props.onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && props.onClick) {
      props.onClick();
    }
  };

  return (
    <Box
      data-qaid={props.dataTestId}
      data-qalabel={props.dataTestLabel}
      sx={defaultStyle}
      onClick={props.clickable ? handleClick : undefined}
      onKeyDown={props.clickable ? handleKeyDown : undefined}
      {...(props.clickable ? { tabIndex: 0 } : {})}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          pl: 2,
          pr: 2,
          ...props.itemSx,
        }}
      >
        {props.loading ? (
          <>
            <Skeleton variant="circular" width="30px" height="30px" />
            <Skeleton variant="text" width="225px" height="30px" />
          </>
        ) : (
           <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {props.icon}
              <Typography
                variant={props.variant}
                component="div"
                sx={props.disabled ? { color: theme.palette.text.disabled } : {}}
              >
                {props.title || ""}
              </Typography>
            </Box>
            {props.subtitle && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                }}
              >
                {props.subtitle || ""}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      {!props.loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pr: 2,
            ...(props.disabled ? { color: theme.palette.text.disabled } : {}),
          }}
        >
          {props.endAdornment}
        </Box>
      )}
    </Box>
  );
}

ClickableFieldContainer.defaultProps = {
  flexDirection: "column",
  clickable: true,
  variant: "sidenav",
  loading: false,
};

export default ClickableFieldContainer;
