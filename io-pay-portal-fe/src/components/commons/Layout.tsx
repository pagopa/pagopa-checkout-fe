import { Container, useTheme } from "@mui/material";
import { Box, SxProps } from "@mui/system";
import React from "react";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  sx?: SxProps;
  children?: React.ReactNode;
  fixedFooterPages: Array<string>;
}
export function Layout({ sx, children, fixedFooterPages }: LayoutProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: { sm: "flex" },
        flexDirection: "column",
        height: "100vh",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Header />
      <Container
        sx={{
          ...sx,
          p: { xs: 6, sm: 0 },
          pl: { xs: 2, sm: 6, md: 0 },
          pr: { xs: 2, sm: 6, md: 0 },
          height: { xs: "100%" },
        }}
        maxWidth={"sm"}
      >
        {children}
      </Container>
      <Footer fixedPages={fixedFooterPages} />
    </Box>
  );
}
