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
  radioValue: string;
}

export const PaymentPSPListGridItem = ({
  pspItem,
  isSelected,
  radioValue,
}: PSPListItemProps) => {
  const { palette } = useTheme();
  const { t } = useTranslation();

  const inputId = `psp-radio-${radioValue}`;

  return (
    <Grid item xs={12}>
      <FormControlLabel
        value={radioValue}
        labelPlacement="start"
        tabIndex={0}
        sx={{
          m: 0,
          mt: "10px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "8px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: isSelected ? palette.primary.main : palette.divider,
          padding: "16px",
          cursor: "pointer",

          "&:hover": {
            color: palette.primary.dark,
            borderColor: "currentColor",
          },

          "&:focus-within": {
            outline: `2px solid ${palette.primary.main}`,
            outlineOffset: 2,
          },

          "& .MuiFormControlLabel-label": {
            width: "100%",
            display: "block",
          },
        }}
        control={
          <Radio
            tabIndex={-1}
            inputProps={{
              id: inputId,
              "aria-label": pspItem.pspBusinessName ?? "PSP",
            }}
            icon={
              <RadioButtonUnchecked data-testid="psp-radio-button-unchecked" />
            }
            checkedIcon={
              <RadioButtonChecked data-testid="psp-radio-button-checked" />
            }
            sx={{
              ml: 2,
              alignSelf: "center",
            }}
          />
        }
        label={
          <Grid container>
            <Grid item xs={9}>
              <Box>
                <Typography variant="sidenav" className="pspFeeName">
                  {pspItem.pspBusinessName}
                </Typography>

                {pspItem.onUs && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={pspUserOnUsIcon}
                      alt=""
                      aria-hidden="true"
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

            <Grid item xs={3} sx={{ ...styles.priceSelectionSection }}>
              <Typography
                className="pspFeeValue"
                variant="sidenav"
                component="div"
                style={{ fontWeight: 600, color: palette.primary.main }}
              >
                {moneyFormat(pspItem.taxPayerFee || 0)}
              </Typography>
            </Grid>
          </Grid>
        }
      />
    </Grid>
  );
};
