export const TRANSLATIONS_IT = {
  mainPage: {
    footer: {
      accessibility: "Accessibilità",
      help: "Aiuto",
    },
    header: {
      disclaimer:
        "L’importo è aggiornato in automatico, così paghi sempre quanto dovuto ed eviti more o altri interessi.",
      detail: {
        detailTitle: "Dettaglio avviso",
        detailAmount: "Importo",
        detailSubject: "Oggetto del pagamento",
        detailReceiver: "Ente Creditore",
        detailFC: "Codice Fiscale Ente Creditore",
        detailIUV: "Codice IUV",
      },
    },
  },
  privacyInfo: {
    privacyDesc: "Proseguendo dichiari di aver letto e compreso l'",
    googleDesc: "Form protetto tramite reCAPTCHA e Google",
    privacy: "Informativa Privacy e i Termini e condizioni d'uso del servizio.",
    privacyPolicy: "Privacy Policy",
    serviceTerms: "Termini di servizio",
  },
  paymentNoticePage: {
    title: "Cosa devi pagare?",
    description: "Inserisci i dati come riportato sull’avviso di pagamento.",
    helpLink: "Vedi un esempio",
    formFields: {
      billCode: "Codice Avviso",
      cf: "Codice Fiscale Ente Creditore",
    },
    formErrors: {
      required: "Campo obbligatorio",
      minCode: "Inserisci 18 cifre",
      minCf: "Inserisci 11 cifre",
    },
    formButtons: {
      cancel: "Indietro",
      submit: "Continua",
    },
  },
  paymentSummaryPage: {
    title: "Avviso di pagamento",
    description:
      "pagoPA aggiorna automaticamente l'importo per assicurarti di aver pagato esattamente quanto dovuto ed evitarsi così more o altri interessi",
    amount: "Importo aggiornato",
    creditor: "Ente Creditore",
    causal: "Causale",
    cf: "Codice Fiscale Ente Creditore",
    iuv: "Codice IUV",
    buttons: {
      cancel: "Indietro",
      submit: "Paga questo avviso",
    },
  },
  paymentEmailPage: {
    title: "Inserisci la tua email",
    description: "Riceverai l'esito del pagamento a questo indirizzo",
    formFields: {
      email: "Indirizzo email",
      confirmEmail: "Ripeti di nuovo",
    },
    formErrors: {
      required: "Campo obbligatorio",
      invalid: "Inserisci un indirizzo email valido",
      notEqual: "Gli indirizzi email devono coincidere",
    },
    formButtons: {
      submit: "Continua",
      cancel: "Indietro",
    },
  },
  indexPage: {
    title: "Paga un avviso",
    description:
      "Puoi usare la tua carta di debito o credito, senza fare alcun login. Riceverai l'esito del pagamento via email.",
  },
  paymentNoticeChoice: {
    qr: {
      title: "Inquadra il codice QR",
      description: "Usa la tua webcam o fotocamera",
    },
    form: {
      title: "Inserisci tu i dati",
      description: "Codice Avviso e Codice Fiscale Ente",
    },
  },
  general: {
    and: "e",
  },
  inputCardPage: {
    title: "Inserisci i dati della carta",
    formFields: {
      name: "Titolare carta",
      number: "Numero carta",
      expirationDate: "Scadenza",
      cvv: "Codice di sicurezza",
      cid: "CID (4 cifre)",
    },
    formErrors: {
      required: "Campo obbligatorio",
      name: "Inserisci come riportato sulla carta",
      number: "Inserisci un numero valido",
      expirationDate: "Inserisci mm/aa",
      cvv: "Inserisci 3 cifre",
      cid: "Inserisci 4 cifre",
    },
    privacyDesc: "Ho letto e compreso ",
    privacyTerms:
      "l'informativa privacy e accetto i termini e condizioni d'uso",
    helpLink: "Dove trovo il codice di sicurezza?",
    modal: {
      title: "Codice di sicurezza",
      description:
        "È un codice a tre cifre, chiamato CVV o CVS, che puoi trovare sul retro della tua carta.",
      descriptionAE:
        "Sulle carte American Express il codice (CID) è a quattro cifre ed è posizionato sul fronte.",
    },
  },
  errorButton: {
    help: "Contatta l'assistenza",
    close: "Chiudi",
  },
  ERRORE_EC: {
    title: "Spiacenti, l’Ente Creditore sta avendo problemi nella risposta",
    buttons: {
      help: "Contatta l'assistenza",
      close: "Chiudi",
    },
  },
  ERRORE_TECNICO: {
    title: "Spiacenti, c’è un problema tecnico con questo avviso",
  },
  ERRORE_DATI: {
    title: "Spiacenti, i dati dell'avviso non sono corretti",
  },
  NOTLISTED: {
    title: "Spiacenti, si è verificato un errore imprevisto",
    body: "Prova di nuovo o contattaci per ricevere assistenza.",
  },
  PAA_PAGAMENTO_DUPLICATO: {
    title: "Questo avviso è stato già pagato!",
    body:
      "La ricevuta è stata inviata all'indirizzo email che hai indicato durante il pagamento.",
  },
  PAA_PAGAMENTO_IN_CORSO: {
    title: "Il pagamento è già in corso, riprova tra qualche minuto",
    body: "Se è passato troppo tempo, segnalacelo!",
  },
  PPT_PAGAMENTO_DUPLICATO: {
    title: "Questo avviso è stato già pagato!",
    body:
      "La ricevuta è stata inviata all'indirizzo email che hai indicato durante il pagamento.",
  },
  PPT_PAGAMENTO_IN_CORSO: {
    title: "Il pagamento è già in corso, riprova tra qualche minuto",
    body: "Se è passato troppo tempo, segnalacelo!",
  },
  PAA_PAGAMENTO_ANNULLATO: {
    title: "Spiacenti, l’Ente Creditore ha revocato questo avviso",
    body: "Contatta l’Ente per maggiori informazioni.",
  },
  PAA_PAGAMENTO_SCADUTO: {
    title: "Spiacenti, l’avviso è scaduto e non è più possibile pagarlo",
    body: "Contatta l’Ente per maggiori informazioni.",
  },
  ErrorCodeDescription: "Codice di errore per l'assistenza",
  clipboard: {
    copy: "Copia",
    copied: "Copiato",
    edit: "Modifica",
  },
  GenericError: {
    title: "Spiacenti, si è verificato un errore imprevisto",
    body: "Prova di nuovo o contattaci per ricevere assistenza.",
  },
  paymentChoicePage: {
    title: "Come vuoi pagare?",
    description:
      "Per sapere di più sui metodi e i costi applicati dai gestori aderenti, visita la pagina ",
    costs: "Trasparenza Costi.",
    creditCard: "Carta di debito o credito",
    bank: "Conto corrente",
    others: "Altri metodi",
    incoming: "In arrivo",
  },
  paymentQrPage: {
    title: "Inquadra il Codice QR",
    description:
      "Assicurati di avere una buona illuminazione. Se il codice non è a fuoco, prova ad allontanarlo leggermente dallo schermo.",
    navigate: "Non funziona? Inserisci manualmente",
  },
  paymentCheckPage: {
    total: "Totale",
    creditCard: "Paga con",
    transaction: "Costo della transazione",
    psp: "Gestita da",
    email: "Invia esito a:",
    modal: {
      title: "Perché c'è un costo di transazione?",
      body:
        "Qualsiasi operazione di trasferimento di denaro (in contanti o in moneta elettronica) ha un costo, che serve a garantirti che quel pagamento sia sicuro e arrivi a buon fine.\n\nOgni gestore(o PSP, Prestatore di Servizi di Pagamento), propone un costo di transazione, a seconda delle proprie politiche commerciali e condizioni contrattuali.\n\nCon pagoPA, questi costi sono trasparenti e il cittadino può scegliere liberamente l'opzione più comoda e conveniente. Verifica l'importo applicato dal PSP che hai scelto, prima di procedere al pagamento.",
    },
    buttons: {
      cancel: "Annulla",
      submit: "Paga",
    },
    drawer: {
      title: "Con quale gestore vuoi pagare?",
      body:
        "In questa lista trovi tutti i gestori compatibili con il tuo metodo, anche se non sei loro cliente.",
      header: {
        name: "Gestore",
        amount: "Costo transazione",
      },
    },
  },
};
