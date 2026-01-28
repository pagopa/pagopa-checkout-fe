/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, ButtonBase, Skeleton, Typography, useTheme } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { FeeRange } from "../../../generated/definitions/payment-ecommerce-v2/FeeRange";
import { moneyFormat } from "../../utils/form/formatters";

function ClickableFieldContainer(props: {
  title?: string;
  feeRange?: FeeRange;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  sx?: SxProps;
  itemSx?: SxProps;
  variant?: "body2" | "sidenav";
  disabled?: boolean;
  loading?: boolean;
  dataTestId?: string;
  dataTestLabel?: string;
  isLast?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const defaultStyle = {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: !props.loading && props.clickable ? "pointer" : "auto",
    borderBottom: props.isLast ? "none" : "1px solid",
    borderBottomColor: props.isLast ? "transparent" : "divider",
    pt: 3,
    pb: 3,
    "&:focus-visible": {
      outlineStyle: "solid",
      outlineWidth: "1px",
      outlineColor: theme.palette.primary.main,
    },
    ...props.sx,
  };

  const handleClick = () => {
    if (!props.disabled && props.onClick) {
      props.onClick();
    }
  };

  return (
    <ButtonBase
      data-qaid={props.dataTestId}
      data-qalabel={props.dataTestLabel}
      sx={defaultStyle}
      onClick={props.clickable ? handleClick : undefined}
      {...(props.clickable ? { tabIndex: 0 } : {})}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 3,
          pl: 2,
          pr: 2,
          ...props.itemSx,
        }}
      >
        {props.loading ? (
          <>
            <Skeleton variant="circular" width="30px" height="30px" />
            <Skeleton variant="text" width="225px" height="30px" />
          </>
        ) : (
          <>
            {props.icon}
            <Box
              display="flex"
              flexDirection="column"
              width="100%"
              textAlign="left"
            >
              <Typography
                variant={props.variant}
                component="div"
                sx={
                  props.disabled ? { color: theme.palette.text.disabled } : {}
                }
              >
                {t(props.title || "")}
              </Typography>
              {props.feeRange && (
                <Typography
                  data-testid="feeRange"
                  variant="body2"
                  color="text.secondary"
                  sx={
                    props.disabled ? { color: theme.palette.text.disabled } : {}
                  }
                >
                  {props.feeRange.min === props.feeRange.max
                    ? t("paymentChoicePage.feeSingle", {
                        value: moneyFormat(props.feeRange.min),
                      })
                    : t("paymentChoicePage.feeRange", {
                        min: moneyFormat(props.feeRange.min),
                        max: moneyFormat(props.feeRange.max),
                      })}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>
      {!props.loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pr: 2,
            ...(props.disabled ? { color: theme.palette.text.disabled } : {}),
          }}
        >
          {props.endAdornment}
        </Box>
      )}
    </ButtonBase>
  );
}

ClickableFieldContainer.defaultProps = {
  flexDirection: "column",
  clickable: true,
  variant: "sidenav",
  loading: false,
};

export default ClickableFieldContainer;
