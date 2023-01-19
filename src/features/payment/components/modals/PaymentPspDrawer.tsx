/* eslint-disable functional/immutable-data */
import { Box, Typography, useTheme } from "@mui/material";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import SkeletonFieldContainer from "../../../../components/Skeletons/SkeletonFieldContainer";
import PspFieldContainer from "../../../../components/TextFormField/PspFieldContainer";
import { moneyFormat } from "../../../../utils/form/formatters";
import { PspList } from "../../models/paymentModel";

export const PaymentPspDrawer = (props: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  list: Array<PspList>;
  onSelect: (id: number) => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <CustomDrawer open={props.open} onClose={props.onClose}>
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
          <Typography
            variant={"caption-semibold"}
            component={"div"}
            aria-hidden="true"
          >
            {t("paymentCheckPage.drawer.header.name")}
          </Typography>
          <Typography
            variant={"caption-semibold"}
            component={"div"}
            aria-hidden="true"
          >
            {t("paymentCheckPage.drawer.header.amount")}
          </Typography>
        </Box>
      </Box>
      {props.loading
        ? Array(3)
            .fill(1)
            .map((_, index) => (
              <SkeletonFieldContainer
                key={index}
                sx={styles.pspContainerStyle}
              />
            ))
        : props.list.map((psp, index) => (
            <PspFieldContainer
              key={index}
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
              onClick={() => {
                props.onSelect(psp.idPsp || 0);
              }}
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
    px: 3,
    mb: 2,
  },
};
