import { InputBase, NativeSelect, styled } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { getSortedLang } from "../../translations/lang";
import supportedLang from "../../translations/lang";
import { fallbackLang } from "../../translations/i18n";

export default function LanguageNativeSelect() {
  const { i18n } = useTranslation();
  const [lang, setLang] = React.useState<string>(i18n.language.split("-")[0]);

  const languages = getSortedLang().map((elem, index) => (
    <option key={index} value={elem.lang.split("-")[0]}>
      {elem.label}
    </option>
  ));

  const changeLanguageHandler = React.useCallback(async (lang: string) => {
    setLang(lang);
    await i18n.changeLanguage(lang);
  }, []);

  const StyledInput = styled(InputBase)(() => ({
    "& .MuiInputBase-input": {
      padding: 0,
    },
  }));

  return (
    <>
      <NativeSelect
        defaultValue={lang in supportedLang ? lang : fallbackLang}
        input={<StyledInput />}
        onChange={(e) => changeLanguageHandler(e.target.value)}
      >
        {languages}
      </NativeSelect>
    </>
  );
}
