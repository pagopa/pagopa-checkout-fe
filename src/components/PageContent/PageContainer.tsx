import { Box, Typography } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createTypography";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PageContainer(props: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  link?: React.ReactNode;
  childrenSx?: CSSProperties;
}) {
  const { t } = useTranslation();

  useEffect(()=>{
    if(props.title){
      document.title = props.title + " - pagoPA";
    }
  },[props.title])

  return (
    <Box mt={3} mb={6} aria-live="polite">
      {!!props.title && (
        <Typography variant="h4" component={"div"}>
          {t(props.title)}
        </Typography>
      )}
      {!!props.description && (
        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          {t(props.description)}
          {!!props.link && props.link}
        </Typography>
      )}
      <Box sx={props.childrenSx}>{props.children}</Box>
    </Box>
  );
}
