import { Box, SxProps, Theme, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { isCrawler } from "../../utils/device/crawlerDetection";

// Default site language used to render metadata (document title) for crawlers.
// Kept in sync with `fallbackLang` in translations/i18n.ts, but declared here
// to avoid importing the i18n module (which has init side-effects) into tests.
const DEFAULT_LANG = "it";

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
      const title = isCrawler()
        ? i18n.getFixedT(DEFAULT_LANG)(props.title)
        : t(props.title);
      (document.title as any) = title + " - pagoPA";
    }
  }, [props.title]);

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
