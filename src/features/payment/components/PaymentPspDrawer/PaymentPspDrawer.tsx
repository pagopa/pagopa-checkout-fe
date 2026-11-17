/* eslint-disable functional/immutable-data */
import { Box, TableSortLabel, Typography, useTheme } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import React from "react";
import { useTranslation } from "react-i18next";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { getConfigOrThrow } from "../../../../utils/config/config";
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import SkeletonFieldContainer from "../../../../components/Skeletons/SkeletonFieldContainer";
import PspFieldContainer from "../../../../components/TextFormField/PspFieldContainer";
import { moneyFormat } from "../../../../utils/form/formatters";
import { visuallyHidden } from "../../../../utils/style/visuallyHidden";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import {
  PspField,
  PspOrderingModel,
  sortBy,
} from "./../../../../utils/SortUtil";

const pspImagePath = (abi: string | undefined): string =>
  pipe(
    abi,
    O.fromNullable,
    O.map((abi) =>
      getConfigOrThrow()
        .CHECKOUT_PAGOPA_LOGOS_CDN.concat("/")
        .concat(abi)
        .concat(".png")
    ),
    O.getOrElse(() => "")
  );

const PSP_SELECT_HINT_ID = "psp-select-hint";
const pspButtonId = (index: number) => `psp-button-${index}`;

export const PaymentPspDrawer = (props: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  pspList: Array<Bundle>;
  onSelect: (selectedPsp: Bundle) => void;
}) => {
  const { open, onClose, loading, pspList, onSelect } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const [sortingOrd, setSortingOrd] = React.useState<PspOrderingModel>({
    fieldName: "taxPayerFee",
    direction: "asc",
  });

  return (
    <CustomDrawer open={open} onClose={onClose}>
      <Box
        sx={{
          py: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" component={"div"}>
          {t("paymentCheckPage.drawer.title")}
        </Typography>
        <Typography variant="body2" sx={{ my: 1 }}>
          {t("paymentCheckPage.drawer.body")}
        </Typography>
        <Box sx={styles.defaultStyle}>
          <PspListSortLabel
            id="sortByName"
            fieldName="pspBusinessName"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
            ariaLabels={{
              inactive: t(
                "paymentCheckPage.drawer.sortByNameAccessibilityLabel.inactive"
              ),
              asc: t(
                "paymentCheckPage.drawer.sortByNameAccessibilityLabel.asc"
              ),
              desc: t(
                "paymentCheckPage.drawer.sortByNameAccessibilityLabel.desc"
              ),
            }}
          >
            {t("paymentCheckPage.drawer.header.name")}
          </PspListSortLabel>
          <PspListSortLabel
            id="sortByFee"
            fieldName="taxPayerFee"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
            ariaLabels={{
              inactive: t(
                "paymentCheckPage.drawer.sortByFeeAccessibilityLabel.inactive"
              ),
              asc: t("paymentCheckPage.drawer.sortByFeeAccessibilityLabel.asc"),
              desc: t(
                "paymentCheckPage.drawer.sortByFeeAccessibilityLabel.desc"
              ),
            }}
          >
            {t("paymentCheckPage.drawer.header.amount")}
          </PspListSortLabel>
        </Box>
      </Box>
      {loading
        ? Array(3)
            .fill(1)
            .map((_, index) => (
              <SkeletonFieldContainer
                key={index}
                sx={styles.pspContainerStyle}
              />
            ))
        : pspList
            .sort(sortBy(sortingOrd.fieldName, sortingOrd.direction))
            .map((psp, index) => (
              <PspFieldContainer
                key={index}
                id={pspButtonId(index)}
                titleVariant="sidenav"
                bodyVariant="body2"
                image={pspImagePath(psp.abi)}
                body={psp.pspBusinessName}
                ariaLabelledBy={`${pspButtonId(index)} ${PSP_SELECT_HINT_ID}`}
                sx={{
                  ...styles.pspContainerStyle,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    borderColor: "currentColor",
                  },
                }}
                endAdornment={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box component="span" sx={visuallyHidden}>
                      {t("paymentCheckPage.drawer.header.amount")}
                    </Box>
                    <Typography
                      id={"psp_" + index.toString()}
                      className="pspFeeValue"
                      variant={"button"}
                      color="primary"
                      component={"div"}
                    >
                      {moneyFormat(psp.taxPayerFee || 0)}
                    </Typography>
                  </Box>
                }
                onClick={() => {
                  onSelect(psp);
                }}
              />
            ))}
      <span id={PSP_SELECT_HINT_ID} hidden>
        {t("paymentCheckPage.drawer.selectPspAccessibilityHint")}
      </span>
    </CustomDrawer>
  );
};

type PspListSortLabelProps = {
  id?: string;
  fieldName: PspField;
  onClick: (sortingOrd: PspOrderingModel) => void;
  orderingModel: PspOrderingModel;
  children: React.ReactNode;
  ariaLabels?: Record<"inactive" | "asc" | "desc", string>;
};

export const PspListSortLabel = ({
  id,
  fieldName,
  onClick,
  orderingModel,
  children,
  ariaLabels,
}: PspListSortLabelProps) => {
  const theme = useTheme();
  const active = orderingModel.fieldName === fieldName;
  const nextDirection =
    active && orderingModel.direction === "asc" ? "desc" : "asc";
  const ariaLabel = ariaLabels?.[active ? orderingModel.direction : "inactive"];

  return (
    <TableSortLabel
      id={id}
      component="button"
      type="button"
      aria-label={ariaLabel}
      active={active}
      direction={active ? orderingModel.direction : "asc"}
      IconComponent={active ? ArrowDownwardIcon : UnfoldMoreIcon}
      onClick={() =>
        onClick({
          fieldName,
          direction: nextDirection,
        })
      }
      sx={{
        border: "none",
        background: "none",
        p: 0.5,
        font: "inherit",
        color: theme.palette.text.primary,
        "& .MuiTableSortLabel-icon": {
          opacity: 1,
          color: theme.palette.text.secondary,
        },
        "&:hover, &:focus": {
          color: theme.palette.text.primary,
        },
        "&:hover .MuiTableSortLabel-icon, &:focus .MuiTableSortLabel-icon": {
          opacity: 1,
        },
        "&.Mui-active": {
          color: theme.palette.primary.main,
          fontWeight: theme.typography.fontWeightBold,
        },
        "&.Mui-active .MuiTableSortLabel-icon": {
          color: theme.palette.primary.main,
        },
        "&.Mui-focusVisible": {
          outline: "2px solid",
          outlineColor: theme.palette.primary.main,
          outlineOffset: "2px",
          borderRadius: 1,
        },
      }}
    >
      {children}
    </TableSortLabel>
  );
};

const styles = {
  defaultStyle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "divider",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    pt: 3,
    pb: 2,
  },
  pspContainerStyle: {
    border: "2px solid",
    borderColor: "divider",
    borderRadius: 2,
    px: 3,
    mb: 2,
  },
};
