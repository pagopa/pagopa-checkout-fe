import { Box, Link, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import pagopaLogo from "../../assets/images/logo-pagopa-spa.svg";
import LanguageFooterMenu from "../LanguageMenu/LanguageNativeSelect";
import lang, { langSelectVisibleOnPages } from "../../translations/lang";

export default function Footer(props: { fixedPages: Array<string> }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const path = location.pathname.split("/").slice(-1)[0];
  const isFixed = () => props.fixedPages.includes(path);

  const showLanguageSelect = () =>
    Object.keys(lang).length > 1 &&
    langSelectVisibleOnPages.some((page) => page.toString() === path);

  return (
    <Box
      component="footer"
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      component="footer"
      pb={{ ...(isFixed() ? {} : { xs: 16 }), sm: 0 }}
      pl={{ xs: 3, sm: 6 }}
      pr={{ xs: 3, sm: 6 }}
      pt={{
        ...(isFixed() ? {} : { xs: "3rem" }),
        sm: 0,
      }}
      bgcolor={{
        ...(isFixed()
          ? { xs: "background.paper" }
          : { xs: "background.default" }),
        sm: "background.paper",
      }}
    >
      <Typography variant="caption" component={"div"}>
        <Box
          display={"flex"}
          alignItems={"center"}
          columnGap={1}
          flexWrap={"wrap"}
        >
          <Link
            href="https://form.agid.gov.it/view/3588af90-773f-11ef-b8bf-4f02c3f2bc4b/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
            title={t("mainPage.footer.accessibility")}
          >
            {t("mainPage.footer.accessibility")}
          </Link>
          <p aria-hidden="true">·</p>
          <Link
            href="https://www.pagopa.gov.it/it/helpdesk/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
            title={t("mainPage.footer.help")}
          >
            {t("mainPage.footer.help")}
          </Link>
          <p aria-hidden="true">·</p>
          <Link
            href="https://checkout.pagopa.it/privacypolicy/it.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
            title={t("mainPage.footer.privacy")}
          >
            {t("mainPage.footer.privacy")}
          </Link>
          <p aria-hidden="true">·</p>
          <Link
            href="https://checkout.pagopa.it/privacypolicy/it.html#termini-e-condizioni-di-uso"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
            title={t("mainPage.footer.terms")}
          >
            {t("mainPage.footer.terms")}
          </Link>
          {showLanguageSelect() && (
            <>
              <p aria-hidden="true">·</p>
              <Box my={1}>
                <LanguageFooterMenu />
              </Box>
            </>
          )}
        </Box>
      </Typography>
      <Link
        href="https://www.pagopa.it/it/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex" }}
        title={t("mainPage.footer.pagoPA")}
      >
        <img
          src={pagopaLogo}
          alt="pagoPA"
          style={{ width: "60px", height: "17px" }}
          aria-hidden="true"
        />
      </Link>
    </Box>
  );
}
