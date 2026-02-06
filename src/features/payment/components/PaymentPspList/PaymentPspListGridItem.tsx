import React from "react";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Radio,
  FormControlLabel,
} from "@mui/material";
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
  isSelected: boolean;
}

export const PaymentPSPListGridItem = ({
  pspItem,
  isSelected,
}: PSPListItemProps) => {
  const { palette } = useTheme();
  const { t } = useTranslation();

  const id = String(pspItem.idPsp);

  return (
    <Grid item xs={12}>
      <FormControlLabel
        sx={{
          m: 0,
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          "& .MuiFormControlLabel-label": {
            width: "100%",
            display: "block",
          },
        }}
        value={id}
        control={
          <Radio
            inputProps={{
              id,
              "aria-label": pspItem.pspBusinessName ?? "PSP",
            }}
            icon={<RadioButtonUnchecked />}
            checkedIcon={<RadioButtonChecked />}
            sx={{
              display: "none",
            }}
          />
        }
        label={
          <Grid
            container
            sx={{
              ...styles.pspListItem,
              borderColor: palette.divider,
              "&:hover": {
                color: palette.primary.dark,
                borderColor: "currentColor",
              },
            }}
          >
            {/* Left side */}
            <Grid item xs={9}>
              <Box>
                <Typography variant="sidenav" className="pspFeeName">
                  {pspItem.pspBusinessName}
                </Typography>

                {pspItem.onUs && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={pspUserOnUsIcon}
                      alt="Icona psp on us"
                      width={24}
                      height="auto"
                    />
                    <Typography variant="body2" style={styles.alreadyClient}>
                      {t("paymentPspListPage.alreadyClient")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Right side */}
            <Grid item xs={3} sx={{ ...styles.priceSelectionSection }}>
              <Typography
                className="pspFeeValue"
                variant="sidenav"
                component="div"
                style={{ fontWeight: 600, color: palette.primary.main }}
              >
                {moneyFormat(pspItem.taxPayerFee || 0)}
              </Typography>

              {isSelected ? (
                <RadioButtonChecked style={{ color: palette.primary.main }} />
              ) : (
                <RadioButtonUnchecked
                  style={{ color: palette.action.active }}
                />
              )}
            </Grid>
          </Grid>
        }
      />
    </Grid>
  );
};
