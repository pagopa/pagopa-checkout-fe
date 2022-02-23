import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import pagopaLogo from "../../assets/images/logo-pagopa-spa.svg";
import LanguageFooterMenu from "../LanguageMenu/LanguageNativeSelect";

export default function Footer(props: { fixedPages: Array<string> }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isFixed = () =>
    props.fixedPages.includes(location.pathname.split("/").slice(-1)[0]);

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      pb={{ ...(isFixed() ? {} : { xs: 16 }), sm: 0 }}
      pl={{ xs: 3, sm: 6 }}
      pr={{ xs: 3, sm: 6 }}
      pt={{
        ...(isFixed() ? {} : { xs: "3rem" }),
        sm: 0,
      }}
      bgcolor={{
        ...(isFixed()
          ? { xs: "background.default" }
          : { xs: "background.paper" }),
        sm: "background.default",
      }}
    >
      <Box display={"flex"} alignItems={"center"} gap={1}>
        <a
          href="https://form.agid.gov.it/view/7628e161-33c0-420f-8c80-4fe362d2c7c5/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "black", textDecoration: "none" }}
        >
          {t("mainPage.footer.accessibility")}
        </a>
        <p>·</p>
        <a
          href="https://www.pagopa.gov.it/it/helpdesk/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "black", textDecoration: "none" }}
        >
          {t("mainPage.footer.help")}
        </a>
        <p>·</p>
        <LanguageFooterMenu />
      </Box>
      <a
        href="https://www.pagopa.it/it/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex" }}
      >
        <img
          src={pagopaLogo}
          alt="pagoPA"
          style={{ width: "56px", height: "36px" }}
        />
      </a>
    </Box>
  );
}
