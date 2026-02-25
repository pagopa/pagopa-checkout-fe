import { InputBase, NativeSelect, styled, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import supportedLang, { getSortedLang } from "../../translations/lang";
import { fallbackLang } from "../../translations/i18n";

export default function LanguageNativeSelect() {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [lang, setLang] = React.useState<string>(i18n.language.split("-")[0]);

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
      color: "#0073E6",
      height: "auto",
      textDecoration: "underline",
      "&:hover": {
        color: "#0062C3",
      }, 
      "&:focus": {
        fontWeight: "bold",
        outline: `2px solid ${theme.palette.text.primary}`,
        borderRadius: "4px",
      },
    },
  }));

  return (
    <>
      <NativeSelect
        id="languageMenu"
        defaultValue={lang in supportedLang ? lang : fallbackLang}
        input={<StyledInput />}
        onChange={(e) => changeLanguageHandler(e.target.value)}
        sx={{
          "& .MuiNativeSelect-icon": {
            color: "#0073E6",
          },
        }}
        inputProps={{
          "aria-label": t("ariaLabels.languageMenu"),
        }}
      >
        {languages}
      </NativeSelect>
    </>
  );
}
