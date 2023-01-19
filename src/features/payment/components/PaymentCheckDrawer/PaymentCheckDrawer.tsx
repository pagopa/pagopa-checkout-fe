import {
  Box,
  TableCell,
  TableSortLabel,
  Typography,
  useTheme,
} from "@mui/material";
import { sort } from "fp-ts/Array";
import { contramap, Ord, reverse } from "fp-ts/lib/Ord";
import * as N from "fp-ts/number";
import * as S from "fp-ts/string";
import { range } from "fp-ts/ReadonlyNonEmptyArray";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import SkeletonFieldContainer from "../../../../components/Skeletons/SkeletonFieldContainer";
import PspFieldContainer from "../../../../components/TextFormField/PspFieldContainer";
import { moneyFormat } from "../../../../utils/form/formatters";
import { PspList } from "../../models/paymentModel";

const byCommision: Ord<PspList> = contramap((psp: PspList) => psp.commission)(
  N.Ord
);

const byName: Ord<PspList> = contramap((psp: PspList) => psp?.name || "")(
  S.Ord
);

type Field = "commission" | "name";

type PspOrderingModel = {
  field: Field;
  direction: "asc" | "desc";
  ordering: Ord<PspList>;
};

type SortingLabelProps = {
  field: Field;
  onClick: (sortingOrd: PspOrderingModel) => void;
  orderingModel: PspOrderingModel;
  ordering: Ord<PspList>;
  children: React.ReactNode;
};

const SortingLabel = ({
  field,
  onClick,
  orderingModel,
  ordering,
  children,
}: SortingLabelProps) => {
  const newDirection =
    orderingModel.field !== field || orderingModel.direction === "desc"
      ? "asc"
      : "desc";

  const newOrdering =
    orderingModel.field === field ? reverse(orderingModel.ordering) : ordering;

  return (
    <TableCell
      sortDirection={orderingModel.direction}
      sx={{ cursor: "pointer" }}
      component={"div"}
      padding="none"
      aria-hidden="true"
      onClick={() =>
        onClick({
          field,
          ordering: newOrdering,
          direction: newDirection,
        })
      }
    >
      {children}
      <TableSortLabel
        direction={orderingModel.direction}
        active={orderingModel.field === field}
      />
    </TableCell>
  );
};

const PaymentCheckDrawer = ({
  open,
  onClose,
  loading,
  list,
  onSelectPsp,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  list: Array<PspList>;
  onSelectPsp: (pspId: number) => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [sortingOrd, setSortingOrd] = React.useState<PspOrderingModel>({
    field: "commission",
    direction: "asc",
    ordering: byCommision,
  });

  return (
    <CustomDrawer open={open} onClose={onClose}>
      <Box sx={{ pt: 1, pb: 1, mb: 2 }}>
        <Typography variant="h6" component={"div"}>
          {t("paymentCheckPage.drawer.title")}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
          {t("paymentCheckPage.drawer.body")}
        </Typography>
        <Box sx={styles.defaultStyle}>
          <SortingLabel
            field="name"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
            ordering={byName}
          >
            {t("paymentCheckPage.drawer.header.name")}
          </SortingLabel>
          <SortingLabel
            field="commission"
            onClick={setSortingOrd}
            orderingModel={sortingOrd}
            ordering={byCommision}
          >
            {t("paymentCheckPage.drawer.header.amount")}
          </SortingLabel>
        </Box>
      </Box>
      {loading
        ? range(0, 3).map((rangeIndex) => (
            <SkeletonFieldContainer
              key={rangeIndex}
              sx={styles.pspContainerStyle}
            />
          ))
        : sort(sortingOrd.ordering)(list).map((psp) => (
            <PspFieldContainer
              key={psp.idPsp}
              titleVariant="sidenav"
              bodyVariant="body2"
              image={psp.image}
              body={psp.name}
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
                  {moneyFormat(psp.commission, 0)}
                </Typography>
              }
              onClick={() => onSelectPsp(psp.idPsp || 0)}
            />
          ))}
    </CustomDrawer>
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
    pl: 3,
    pr: 3,
    mb: 2,
  },
};

export default PaymentCheckDrawer;
