/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, Skeleton, SxProps, Typography } from "@mui/material";
import React from "react";

function SkeletonFieldContainer(props: { sx?: SxProps }) {
  const defaultStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    pt: 2,
    pb: 2,
    width: "100%",
    minWidth: { xs: "100%", sm: "327px" },
    height: "106px",
  };

  return (
    <Box sx={{ ...defaultStyle, ...props.sx }} maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          gap: 3,
          ml: 2,
        }}
      >
        <Skeleton variant="circular" width="40px" height="40px" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <Typography variant="sidenav" component={"div"}>
            <Skeleton variant="text" width="50px" height="40px" />
          </Typography>
          <Typography variant="body2" component={"div"}>
            <Skeleton variant="text" width="215px" height="24px" />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default SkeletonFieldContainer;
