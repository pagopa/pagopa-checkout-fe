/* eslint-disable functional/immutable-data */
import {
  Box,
  TableCell,
  TableSortLabel,
  Typography,
  useTheme,
} from "@mui/material";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { getConfigOrThrow } from "../../../../utils/config/config";
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import SkeletonFieldContainer from "../../../../components/Skeletons/SkeletonFieldContainer";
import PspFieldContainer from "../../../../components/TextFormField/PspFieldContainer";
import { moneyFormat } from "../../../../utils/form/formatters";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";

const pspImagePath = (abi: string | undefined): string =>
  pipe(
    abi,
    O.fromNullable,
    O.map((abi) =>
      getConfigOrThrow()
        .CHECKOUT_PAGOPA_ASSETS_CDN.concat("/")
        .concat(abi)
        .concat(".png")
    ),
    O.getOrElse(() => "")
  );

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
          <SortLabel
            fieldName="bundleName"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
          >
            {t("paymentCheckPage.drawer.header.name")}
          </SortLabel>
          <SortLabel
            fieldName="taxPayerFee"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
          >
            {t("paymentCheckPage.drawer.header.amount")}
          </SortLabel>
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
                titleVariant="sidenav"
                bodyVariant="body2"
                image={pspImagePath(psp.abi)}
                body={psp.bundleName}
                sx={{
                  ...styles.pspContainerStyle,
                  cursor: "pointer",
                  "&:hover": {
                    color: theme.palette.primary.dark,
                    borderColor: "currentColor",
                  },
                }}
                endAdornment={
                  <Typography
                    variant={"button"}
                    color="primary"
                    component={"div"}
                  >
                    {moneyFormat(psp.taxPayerFee || 0)}
                  </Typography>
                }
                onClick={() => {
                  onSelect(psp);
                }}
              />
            ))}
    </CustomDrawer>
  );
};

const sortBy =
  (field: PspField, direction: "asc" | "desc") => (a: Bundle, b: Bundle) => {
    const fieldA = a[field];
    const fieldB = b[field];
    const order = direction === "asc" ? 1 : -1;

    return fieldA && fieldB ? (fieldA > fieldB ? order : -order) : -order;
  };

type PspField = "taxPayerFee" | "bundleName";

type PspOrderingModel = {
  fieldName: PspField;
  direction: "asc" | "desc";
};

type SortLabelProps = {
  fieldName: PspField;
  onClick: (sortingOrd: PspOrderingModel) => void;
  orderingModel: PspOrderingModel;
  children: React.ReactNode;
};

const SortLabel = ({
  fieldName,
  onClick,
  orderingModel,
  children,
}: SortLabelProps) => {
  const direction = orderingModel.direction === "asc" ? "desc" : "asc";

  return (
    <TableCell
      sortDirection={orderingModel.direction}
      sx={{ cursor: "pointer" }}
      component="div"
      padding="none"
      aria-hidden="true"
      onClick={() =>
        onClick({
          fieldName,
          direction,
        })
      }
    >
      {children}
      <TableSortLabel
        direction={orderingModel.direction}
        active={orderingModel.fieldName === fieldName}
      />
    </TableCell>
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
