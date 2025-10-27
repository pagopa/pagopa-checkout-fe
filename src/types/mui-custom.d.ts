// theme.d.ts
import "@mui/material/styles";

interface FooterTheme {
  principal?: {
    background?: TypeBackground;
  };
  fixed?: {
    background?: TypeBackground;
  };
}

interface DrawerCardTheme {
  background?: TypeBackground;
  sectionTitle?: TypeText;
  sectionBody?: TypeText;
}

interface PaymentSummaryTheme {
  infoButton?: { background?: TypeBackground };
}

interface DrawerTheme {
  card?: DrawerCardTheme;
  icon?: {
    color?: SimplePaletteColorOptions;
    background?: TypeBackground;
  };
}

interface CustomPalette {
  footer?: FooterTheme;
  drawer?: DrawerTheme;
  paymentSummary?: PaymentSummaryTheme;
}

declare module "@mui/material/styles" {
  interface Palette {
    custom: CustomPalette;
  }

  interface PaletteOptions {
    custom?: CustomPalette;
  }
}

declare module "@mui/material/styles" {
  interface Palette {
    custom: CustomPalette;
  }

  interface PaletteOptions {
    custom?: CustomPalette;
  }
}
