import { Box, InputBase, NativeSelect, styled, useTheme } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import supportedLang, { getSortedLang } from "../../translations/lang";
import { fallbackLang } from "../../translations/i18n";

export default function LanguageNativeSelect() {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [lang, setLang] = React.useState<string>(i18n.language.split("-")[0]);

  const currentLanguageLabel = (lang: string) => {
    const languages = getSortedLang();
    const currLang = languages.find((elem) => elem.lang.split("-")[0] === lang);
    // currLang guaranteed to exist
    return currLang ? currLang.label : "";
  };

  const languages = getSortedLang().map((elem, index) => (
    <option key={index} value={elem.lang.split("-")[0]}>
      {elem.label}
    </option>
  ));

  const changeLanguageHandler = React.useCallback(async (lang: string) => {
    setLang(lang);
    localStorage.setItem("i18nextLng", lang);
    await i18n.changeLanguage(lang);
  }, []);

  const StyledInput = styled(InputBase)(() => ({
    "& .MuiInputBase-input": {
      padding: 0,
      fontSize: theme.typography.caption.fontSize,
      color: theme.palette.text.primary,
      height: "auto",
    },
  }));

  return (
    <>
      <Box sx={visuallyHidden}>{t("ariaLabels.languageMenu")}</Box>
      <NativeSelect
        id="languageMenu"
        defaultValue={lang in supportedLang ? lang : fallbackLang}
        input={<StyledInput />}
        onChange={(e) => changeLanguageHandler(e.target.value)}
        sx={{
          "& .MuiNativeSelect-icon": {
            color: theme.palette.text.primary,
          },
        }}
        aria-label={currentLanguageLabel(
          lang in supportedLang ? lang : fallbackLang
        )}
      >
        {languages}
      </NativeSelect>
    </>
  );
}
