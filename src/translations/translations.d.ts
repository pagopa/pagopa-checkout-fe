interface Languages {
  [key: string]: {
    label: string;
    lang: string;
    translation: Translation;
  };
}

/**
 * Defines the structure of translations and integrates it with the react-i18n module.
 * When useTranslate is called, it verifies if the provided string exists.
 * If the string does not exist, a compile error is returned.
 */
interface Translation {
  acsSlow: {
    body: string;
    title: string;
  };
  app: {
    title: string;
  };
  ariaLabels: {
    appLanguage: string;
    close: string;
    editCard: string;
    editDonation: string;
    editPsp: string;
    informationDialog: string;
    informationLink: string;
    languageMenu: string;
    loading: string;
  };
  cancelledPage: {
    body: string;
    button: string;
  };
  cartDetail: {
    amount: string;
    companyName: string;
    description: string;
    fiscalCode: string;
    noticeNumber: string;
  };
  clipboard: {
    copied: string;
    copy: string;
    edit: string;
  };
  DOMAIN_UNKNOWN: {
    title: string;
    buttons: {
      close: string;
      help: string;
    };
  };
  DONATIONLIST_ERROR: string;
  donationPage: {
    click: string;
    code: string;
    description: string;
    dismissCTA: string;
    dismissDescription: string;
    dismissTitle: string;
    entity: string;
    ioDescription: string;
    modalBody2: string;
    modalTitle: string;
    openSection: string;
    payNotice: string;
    portfolio: string;
    submitCard: string;
    submitIO: string;
    title: string;
    volunteer: string;
  };
  errorButton: {
    close: string;
    help: string;
    retry: string;
  };
  ErrorCodeDescription: string;
  GENERIC_ERROR: {
    body: string;
    title: string;
  };
  general: {
    and: string;
  };
  indexPage: {
    description: string;
    title: string;
  };
  inputCardPage: {
    formErrors: {
      cid: string;
      cvv: string;
      expirationDate: string;
      name: string;
      number: string;
      required: string;
    };
    formFields: {
      cid: string;
      cvv: string;
      expirationDate: string;
      name: string;
      number: string;
    };
    helpLink: string;
    modal: {
      description: string;
      descriptionAE: string;
      title: string;
    };
    title: string;
  };
  INVALID_CARD: {
    body: string;
    title: string;
  };
  INVALID_DECODE: {
    body: string;
    title: string;
  };
  INVALID_QRCODE: {
    body: string;
    title: string;
  };
  koPage: {
    body: string;
    button: string;
    helpButton: string;
    title: string;
  };
  mainPage: {
    footer: {
      accessibility: string;
      help: string;
      pagoPA: string;
      privacy: string;
      terms: string;
    };
    header: {
      detail: {
        detailAmount: string;
        detailFC: string;
        detailIUV: string;
        detailReceiver: string;
        detailSubject: string;
        detailTitle: string;
      };
      disclaimer: string;
    };
    main: {
      skipToContent: string;
    };
  };
  NOTLISTED: {
    body: string;
    title: string;
  };
  PAYMENT_CANCELED: {
    body: string;
    title: string;
  };
  PAYMENT_DATA_ERROR: {
    title: string;
  };
  PAYMENT_DUPLICATED: {
    body: string;
    title: string;
  };
  PAYMENT_EXPIRED: {
    body: string;
    title: string;
  };
  PAYMENT_ONGOING: {
    body: string;
    title: string;
  };
  PAYMENT_UNAVAILABLE: {
    title: string;
  };
  PAYMENT_UNKNOWN: {
    body: string;
    title: string;
  };
  paymentEmailPage: {
    description: string;
    formButtons: {
      back: string;
      submit: string;
    };
    formErrors: {
      invalid: string;
      notEqual: string;
      required: string;
    };
    formFields: {
      confirmEmail: string;
      email: string;
    };
    title: string;
  };
  paymentResponsePage: {
    0: {
      body: string;
      title: string;
    };
    1: {
      body: string;
      title: string;
    };
    2: {
      body: string;
      title: string;
    };
    3: {
      body: string;
      title: string;
    };
    4: {
      body: string;
      title: string;
    };
    5: {
      title: string;
    };
    6: {
      title: string;
    };
    7: {
      body: string;
      title: string;
    };
    8: {
      body: string;
      title: string;
    };
    10: {
      body: string;
      title: string;
    };
    12: {
      title: string;
    };
    17: {
      body: string;
      title: string;
    };
    "3dsNotInitiated": {
      body: string;
      title: string;
    };
    survey: {
      body: string;
      link: {
        href: string;
        text: string;
      };
      title: string;
    };
  };
  paymentCheckPage: {
    buttons: {
      cancel: string;
      submit: string;
      wait: string;
    };
    creditCard: string;
    disclaimer: {
      cheaper: string;
      yourCard: string;
    };
    drawer: {
      body: string;
      header: {
        amount: string;
        name: string;
      };
      title: string;
    };
    email: string;
    modal: {
      body: string;
      cancelBody: string;
      cancelButton: string;
      cancelTitle: string;
      link: string;
      submitButton: string;
      title: string;
    };
    psp: string;
    total: string;
    transaction: string;
  };
  paymentChoicePage: {
    bank: string;
    button: string;
    costs: string;
    creditCard: string;
    description: string;
    incoming: string;
    others: string;
    showMore: string;
    title: string;
  };
  paymentMethods: {
    bpay: string;
    cc: string;
    cp: string;
    ppay: string;
  };
  paymentNoticeChoice: {
    form: {
      description: string;
      title: string;
    };
    qr: {
      description: string;
      title: string;
    };
  };
  paymentNoticePage: {
    description: string;
    formButtons: {
      cancel: string;
      submit: string;
    };
    formErrors: {
      minCf: string;
      minCode: string;
      required: string;
    };
    formFields: {
      billCode: string;
      cf: string;
    };
    helpLink: string;
    title: string;
  };
  paymentQrPage: {
    camBlocked: string;
    description: string;
    navigate: string;
    reloadPage: string;
    title: string;
  };
  paymentSummaryPage: {
    amount: string;
    billCode: string;
    buttons: {
      cancel: string;
      ok: string;
      submit: string;
    };
    causal: string;
    cf: string;
    creditor: string;
    description: string;
    dialog: {
      description: string;
      title: string;
    };
    iuv: string;
    title: string;
  };
  POLLING_SLOW: {
    body: string;
    title: string;
  };
  privacyInfo: {
    googleDesc: string;
    privacyDesc: string;
    privacyDonation: string;
  };
  STATUS_ERROR: {
    body: string;
    title: string;
  };
  TIMEOUT: {
    body: string;
    title: string;
  };
  errorMessageNPG: {
    HF0002: string;
    HF0003: string;
    HF0004: string;
    HF0005: string;
    HF0006: string;
    HF0007: string;
    HF0009: string;
    HF0001: string;
  };
}
