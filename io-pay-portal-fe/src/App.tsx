import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@pagopa/mui-italia/theme";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Guard from "./components/commons/Guard";
import { Layout } from "./components/commons/Layout";
import IndexPage from "./routes/IndexPage";
import InputCardPage from "./routes/InputCardPage";
import PaymentChoicePage from "./routes/PaymentChoicePage";
import PaymentEmailPage from "./routes/PaymentEmailPage";
import PaymentOutlet from "./routes/PaymentOutlet";
import PaymentNoticePage from "./routes/PaymentNoticePage";
import PaymentSummaryPage from "./routes/PaymentSummaryPage";
import "./translations/i18n";
import PaymentQrPage from "./routes/PaymentQrPage";
import { SessionItems } from "./utils/storage/sessionStorage";
import PaymentCheckPage from "./routes/PaymentCheckPage";

const checkoutTheme = createTheme({
  ...theme,
  components: {
    ...theme.components,
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          height: 0,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
  },
});

export function App() {
  const fixedFooterPages = ["payment", "qrcode"];

  return (
    <ThemeProvider theme={checkoutTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout fixedFooterPages={fixedFooterPages}>
          <Routes>
            <Route path="/" element={<Navigate to="/payment" />} />
            <Route path="/payment" element={<PaymentOutlet />}>
              <Route path="" element={<IndexPage />} />
              <Route path="qr-reader" element={<PaymentQrPage />} />
              <Route path="notice" element={<PaymentNoticePage />} />
              <Route
                path="summary"
                element={
                  <Guard item={SessionItems.paymentInfo}>
                    <PaymentSummaryPage />
                  </Guard>
                }
              />
              <Route
                path="email"
                element={
                  <Guard item={SessionItems.paymentInfo}>
                    <PaymentEmailPage />
                  </Guard>
                }
              />
              <Route
                path="inputcard"
                element={
                  <Guard item={SessionItems.email}>
                    <InputCardPage />
                  </Guard>
                }
              />
              <Route
                path="paymentchoice"
                element={
                  <Guard item={SessionItems.paymentId}>
                    <PaymentChoicePage />
                  </Guard>
                }
              />
              <Route
                path="check"
                element={
                  <Guard item={SessionItems.paymentId}>
                    <PaymentCheckPage />
                  </Guard>
                }
              />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
