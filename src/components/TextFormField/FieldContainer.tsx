/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, Skeleton, SxProps, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface FieldContainerProps {
  title: string;
  body: string | number | undefined;
  icon?: React.ReactNode;
  flexDirection?: "row" | "column";
  titleVariant?: "body2" | "sidenav";
  bodyVariant?: "body2" | "sidenav";
  sx?: SxProps;
  endAdornment?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  tabIndex?: number;
  role?: string;
  overflowWrapBody?: boolean;
  disclaimer?: React.ReactNode;
}

const defaultStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid",
  borderBottomColor: "divider",
  py: 2,
};

function FieldContainer(props: FieldContainerProps) {
  const { t } = useTranslation();
  const {
    onClick,
    onKeyDown,
    tabIndex,
    role,
    sx,
    loading,
    icon,
    flexDirection = "column",
    titleVariant = "body2",
    bodyVariant = "sidenav",
    overflowWrapBody = true,
    title,
    body,
    endAdornment,
    disclaimer,
  } = props;
  return (
    <Box
      sx={{ ...defaultStyle, ...sx }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
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
        {icon && loading ? (
          <Skeleton variant="circular" width="40px" height="40px" />
        ) : (
          icon
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: flexDirection === "row" ? "center" : "",
            justifyContent: "space-between",
            flexDirection,
            width: "100%",
          }}
        >
          <Typography variant={titleVariant} component={"div"} pr={2}>
            {loading ? (
              <Skeleton variant="text" width="125px" height="30px" />
            ) : (
              t(title)
            )}
          </Typography>
          <Typography
            variant={bodyVariant}
            component={"div"}
            sx={{
              overflowWrap: overflowWrapBody ? "anywhere" : "normal",
            }}
          >
            {loading ? (
              <Skeleton variant="text" width="188px" height="24px" />
            ) : (
              body
            )}
          </Typography>
          {!loading && disclaimer}
        </Box>
      </Box>
      {endAdornment}
    </Box>
  );
}

export default FieldContainer;
