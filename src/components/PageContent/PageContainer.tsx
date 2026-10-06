import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { isCrawler } from "../../utils/device/crawlerDetection";
import { fallbackLang } from "../../translations/fallbackLang";

export default function PageContainer(props: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  link?: React.ReactNode;
  childrenSx?: SxProps<Theme>;
}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (props.title) {
      // For search engine crawlers, always render the document title in the
      // default site language (Italian) so that search results are not shown
      // in the crawler navigator language. Real users keep their own language.
      const title =
        isCrawler() && i18n?.getFixedT
          ? i18n.getFixedT(fallbackLang)(props.title)
          : t(props.title);
      (document.title as any) = title + " - pagoPA";
    }
  }, [props.title, i18n?.language, t]);

  return (
    <Box mt={3} mb={6} aria-live="polite">
      {!!props.title && (
        <Typography variant="h4" component={"h1"}>
          {t(props.title)}
        </Typography>
      )}
      {!!props.description && (
        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          <Trans i18nKey={props.description} />
          {!!props.link && props.link}
        </Typography>
      )}
      <Box sx={props.childrenSx}>{props.children}</Box>
    </Box>
  );
}
