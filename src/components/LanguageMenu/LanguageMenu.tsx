import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { fallbackLang } from "../../translations/i18n";
import { getSortedLang } from "../../translations/lang";
import supportedLang from "../../translations/lang";

export default function LanguageMenu() {
  const { i18n } = useTranslation();
  const [lang, setLang] = React.useState<string>(i18n.language.split("-")[0]);
  const languages = getSortedLang().map((elem, index) => (
    <MenuItem
      key={index}
      onClick={() => {
        void changeLanguageHandler(elem.lang.split("-")[0]);
        handleMenuClose();
      }}
    >
      {elem.label}
    </MenuItem>
  ));

  const changeLanguageHandler = React.useCallback(async (lang: string) => {
    setLang(lang);
    await i18n.changeLanguage(lang);
  }, []);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuId = "lang-menu";
  const isMenuOpen = !!anchorEl;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        disableEnforceFocus
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {languages}
      </Menu>
      <IconButton
        size="medium"
        edge="end"
        aria-label="account of current user"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
        style={{ borderRadius: 5 }}
      >
        <Typography
          variant="h6"
          gutterBottom
          component="div"
          style={{ color: "#0073E6" }}
        >
          {lang in supportedLang
            ? lang.toUpperCase()
            : fallbackLang.toUpperCase()}
        </Typography>
        <KeyboardArrowDownIcon style={{ color: "#0073E6" }} />
      </IconButton>
    </>
  );
}
