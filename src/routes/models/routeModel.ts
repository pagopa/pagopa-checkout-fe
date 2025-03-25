export enum CheckoutRoutes {
  ROOT = "",
  DONA = "dona",
  AUTH_CALLBACK = "auth-callback",
  AUTH_EXPIRED = "autenticazione-scaduta",
  LEGGI_CODICE_QR = "leggi-codice-qr",
  INSERISCI_DATI_AVVISO = "inserisci-dati-avviso",
  DATI_PAGAMENTO = "dati-pagamento",
  INSERISCI_EMAIL = "inserisci-email",
  INSERISCI_CARTA = "inserisci-carta",
  SCEGLI_METODO = "scegli-metodo",
  RIEPILOGO_PAGAMENTO = "riepilogo-pagamento",
  SELEZIONE_PSP = "seleziona-metodo-di-pagamento",
  GDI_CHECK = "gdi-check",
  CARRELLO = "c",
  ESITO = "esito",
  ANNULLATO = "annullato",
  SESSIONE_SCADUTA = "sessione-scaduta",
  ERRORE = "errore",
}

export enum ROUTE_FRAGMENT {
  GDI_IFRAME_URL = "gdiIframeUrl",
  OUTCOME = "outcome",
}
