import React from "react";
import { Box, Typography } from "@mui/material";

type ErrorBlockProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  body: string;
  actions?: React.ReactNode;
  testIdPrefix?: string; // utile per id/data-testid unici
};

export function ErrorBlock({
  imageSrc,
  imageAlt,
  title,
  body,
  actions,
  testIdPrefix = "error",
}: ErrorBlockProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ mt: 15 }}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        style={{ width: "80px", height: "80px" }}
      />

      <Box
        mt={3}
        mb={3}
        gap={2}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" component="h1" id={`${testIdPrefix}-title`}>
          {title}
        </Typography>
        <Typography variant="body2" component="div" id={`${testIdPrefix}-body`}>
          {body}
        </Typography>
      </Box>

      {actions && (
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ mt: 2 }}
          alignItems="center"
          data-testid={`${testIdPrefix}-actions`}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
