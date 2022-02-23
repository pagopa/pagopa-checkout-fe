import { Grid, Box, Typography } from "@mui/material";
import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import pagopaLogo from "../../assets/images/pagopa-logo.svg";
import { loadState, SessionItems } from "../../utils/storage/sessionStorage";
import { PaymentCheckData } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../../utils/form/formatters";
import DrawerDetail from "../Header/DrawerDetail";

export default function Header() {
  const PaymentCheckData = loadState(
    SessionItems.checkData
  ) as PaymentCheckData;
  const [drawstate, setDrawstate] = React.useState(false);

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawstate(open);
  };

  return (
    <Box p={3} bgcolor={"white"}>
      <Grid container spacing={0}>
        <Grid item xs={2} display="flex" alignItems="center">
          <img
            src={pagopaLogo}
            alt="pagoPA"
            style={{ width: "56px", height: "36px" }}
          />
        </Grid>
        <Grid item xs={8} sx={{ display: { xs: "none", sm: "block" } }}>
          <Typography
            variant="body2"
            component="div"
            sx={{ textAlign: "center" }}
          >
            {PaymentCheckData ? PaymentCheckData.receiver : ""}
          </Typography>
          <Typography
            fontWeight={600}
            variant="body2"
            component="div"
            sx={{ textAlign: "center" }}
          >
            {PaymentCheckData ? PaymentCheckData.subject : ""}
          </Typography>
          <Typography
            color="primary.main"
            variant="body2"
            component="div"
            fontWeight={600}
            sx={{ textAlign: "center" }}
          >
            {PaymentCheckData
              ? `€ ${moneyFormat(PaymentCheckData.amount.amount)}`
              : ""}
          </Typography>
        </Grid>
        <Grid
          item
          xs={10}
          sx={{ display: { sm: "none" } }}
          display="flex"
          alignItems="center"
        >
          <Typography
            color="primary.main"
            variant="body2"
            component="div"
            fontWeight={600}
            display="flex"
            alignItems="center"
            justifyContent="end"
          >
            {PaymentCheckData
              ? moneyFormat(PaymentCheckData.amount.amount)
              : ""}
            <InfoOutlinedIcon
              color="primary"
              sx={{ ml: 1 }}
              onClick={toggleDrawer(true)}
            />
          </Typography>
        </Grid>
      </Grid>
      <DrawerDetail
        PaymentCheckData={PaymentCheckData}
        drawstate={drawstate}
        toggleDrawer={toggleDrawer}
      />
    </Box>
  );
}
