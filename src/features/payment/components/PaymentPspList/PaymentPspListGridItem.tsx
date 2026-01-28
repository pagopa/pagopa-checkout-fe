import React from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { RadioButtonChecked, RadioButtonUnchecked } from "@mui/icons-material";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { moneyFormat } from "../../../../utils/form/formatters";
import pspUserOnUsIcon from "../../../../assets/images/psp-user-on-us.svg";

const styles = {
  pspListItem: {
    width: "100%",
    borderRadius: "8px",
    borderWidth: "1px",
    padding: "16px",
    marginTop: "10px",
    borderStyle: "solid",
    cursor: "pointer",
  },
  alreadyClient: {
    color: "#5517E3",
  },
  priceSelectionSection: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 2,
  },
};

interface PSPListItemProps {
  pspItem: Bundle;
  handleClick: (event?: React.MouseEvent<HTMLDivElement>) => void;
  isSelected: boolean;
}

export const PaymentPSPListGridItem = ({
  pspItem,
  handleClick,
  isSelected = false,
}: PSPListItemProps) => {
  const { palette } = useTheme();
  const { t } = useTranslation();
  return (
    <Grid
      id={pspItem.idPsp}
      tabIndex={0}
      container
      onClick={handleClick}
      sx={{
        ...styles.pspListItem,
        borderColor: palette.divider,
        "&:hover": { color: palette.primary.dark, borderColor: "currentColor" },
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          !!handleClick && handleClick();
        }
      }}
    >
      {/* Left side with psp name and onUs info */}
      <Grid size={{ xs: 9 }}>
        <Box>
          <Typography variant="sidenav" className="pspFeeName">
            {pspItem.pspBusinessName}
          </Typography>
          {pspItem.onUs && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0 }}>
              <img
                src={pspUserOnUsIcon}
                alt="Icona psp on us"
                width={24}
                height="auto"
                aria-hidden="true"
              />
              <Typography variant="body2" style={styles.alreadyClient}>
                {t("paymentPspListPage.alreadyClient")}
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>

      {/* Right side with fee and radiobox */}
      <Grid size={{ xs: 3 }} sx={styles.priceSelectionSection}>
        <Typography
          className="pspFeeValue"
          variant="sidenav"
          component={"div"}
          style={{ fontWeight: 600, color: palette.primary.main }}
        >
          {moneyFormat(pspItem.taxPayerFee || 0)}
        </Typography>
        {isSelected ? (
          <RadioButtonChecked
            id="psp-radio-button-checked"
            style={{ color: palette.primary.main }}
          />
        ) : (
          <RadioButtonUnchecked
            id="psp-radio-button-unchecked"
            style={{ color: palette.action.active }}
          />
        )}
      </Grid>
    </Grid>
  );
};
