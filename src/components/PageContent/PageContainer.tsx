import { Box, Typography } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createTypography";
import React from "react";
import { useTranslation } from "react-i18next";
import { normalizeKey } from "../../translations/translationsHelper";

export default function PageContainer(props: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  link?: React.ReactNode;
  childrenSx?: CSSProperties;
}) {
  const { t } = useTranslation();

  return (
    <Box mt={3} mb={6} aria-live="polite">
      {!!props.title && (
        <Typography variant="h4" component={"div"}>
          {t(normalizeKey(props.title))}
        </Typography>
      )}
      {!!props.description && (
        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          {t(normalizeKey(props.description))}
          {!!props.link && props.link}
        </Typography>
      )}
      <Box sx={props.childrenSx}>{props.children}</Box>
    </Box>
  );
}
