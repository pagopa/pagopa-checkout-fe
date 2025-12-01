import {
  PaymentMethod,
  PaymentMethodInfo,
  PaymentInfo,
  Cart,
  PaymentNotice,
  PaymentFormFields,
} from "features/payment/models/paymentModel";
import { NonNegativeInteger } from "@pagopa/ts-commons/lib/numbers";
import { AmountEuroCents } from "../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { Bundle } from "../../../generated/definitions/payment-ecommerce/Bundle";
import {
  NewTransactionResponse as NewTransactionResponseV2,
  ClientIdEnum as ClientIdEnumV2,
} from "../../../generated/definitions/payment-ecommerce-v2/NewTransactionResponse";
import {
  NewTransactionResponse as NewTransactionResponseV3,
  ClientIdEnum as ClientIdEnumV3,
} from "../../../generated/definitions/payment-ecommerce-v2/NewTransactionResponse";
import { RptId } from "../../../generated/definitions/payment-ecommerce/RptId";
import { SessionPaymentMethodResponse } from "../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { CartRequestReturnUrls } from "../../../generated/definitions/payment-ecommerce/CartRequest";
import { PaymentMethodManagementTypeEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../generated/definitions/payment-ecommerce/PaymentMethodResponse";
import { PaymentMethodsResponse } from "../../../generated/definitions/payment-ecommerce/PaymentMethodsResponse";
import { PaymentMethodStatusEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { PaymentMethodManagementTypeEnum as PaymentMethodManagementTypeEnumV3 } from "../../../generated/definitions/payment-ecommerce-v3/PaymentMethodManagementType";
import { PaymentMethodResponse as PaymentMethodResponseV3 } from "../../../generated/definitions/payment-ecommerce-v3/PaymentMethodResponse";
import { PaymentMethodsResponse as PaymentMethodsResponseV3 } from "../../../generated/definitions/payment-ecommerce-v3/PaymentMethodsResponse";
import { PaymentMethodStatusEnum as PaymentMethodStatusEnumV3 } from "../../../generated/definitions/payment-ecommerce-v3/PaymentMethodStatus";
import { CalculateFeeResponse } from "../../../generated/definitions/payment-ecommerce-v2/CalculateFeeResponse";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce-v2/TransactionInfo";
import { SendPaymentResultOutcomeEnum } from "../../../generated/definitions/payment-ecommerce-v3/NewTransactionResponse";
import { WalletInfo } from "../../../generated/definitions/checkout-wallets-v1/WalletInfo";
import { WalletStatusEnum } from "../../../generated/definitions/checkout-wallets-v1/WalletStatus";
import { WalletApplicationInfo } from "../../../generated/definitions/checkout-wallets-v1/WalletApplicationInfo";
import { WalletClientStatusEnum } from "../../../generated/definitions/checkout-wallets-v1/WalletClientStatus";
import { WalletInfoDetails } from "../../../generated/definitions/checkout-wallets-v1/WalletInfoDetails";
import { WalletId } from "../../../generated/definitions/checkout-wallets-v1/WalletId";

export const transactionInfoOK: TransactionInfo = {
  transactionId: "6f7d9be5fbb94ca29bf55972321783e7",
  payments: [
    {
      paymentToken: "1fb8539bdbc94123849a21be8eead8dd",
      rptId: "77777777777302000100000009488" as RptId,
      reason: "TARI/TEFA 2021",
      amount: 12000 as AmountEuroCents,
      transferList: [
        {
          digitalStamp: true,
          paFiscalCode: "00000000000",
          transferAmount: 100 as AmountEuroCents,
          transferCategory: "transfCat0",
        },
      ],
      isAllCCP: false,
    },
  ],
  status: TransactionStatusEnum.NOTIFIED_OK,
  nodeInfo: {
    sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
  },
  gatewayInfo: {
    gateway: "NPG",
    authorizationStatus: "OK",
    authorizationCode: "000",
  },
};

export const transaction: NewTransactionResponseV2 = {
  transactionId: "6f7d9be5fbb94ca29bf55972321783e7",
  status: TransactionStatusEnum.ACTIVATED,
  payments: [
    {
      paymentToken: "1fb8539bdbc94123849a21be8eead8dd",
      rptId: "77777777777302000100000009488" as RptId,
      reason: "TARI/TEFA 2021",
      amount: 12000 as AmountEuroCents,
      transferList: [
        {
          digitalStamp: true,
          paFiscalCode: "00000000000",
          transferAmount: 100 as AmountEuroCents,
          transferCategory: "transfCat0",
        },
      ],
      isAllCCP: false,
    },
  ],
  clientId: ClientIdEnumV2.CHECKOUT,
  authToken: "token",
};

export const transactionV3: NewTransactionResponseV3 = {
  transactionId: "6f7d9be5fbb94ca29bf55972321783e7",
  status: TransactionStatusEnum.ACTIVATED,
  payments: [
    {
      paymentToken: "1fb8539bdbc94123849a21be8eead8dd",
      rptId: "77777777777302000100000009488" as RptId,
      reason: "TARI/TEFA 2021",
      amount: 12000 as AmountEuroCents,
      transferList: [
        {
          digitalStamp: true,
          paFiscalCode: "00000000000",
          transferAmount: 100 as AmountEuroCents,
          transferCategory: "transfCat0",
        },
      ],
      isAllCCP: false,
    },
  ],
  clientId: ClientIdEnumV3.CHECKOUT,
  authToken: "token",
};

export const paymentMethod: PaymentMethod = {
  paymentMethodId: "e7058cac-5e1a-4002-8994-5bab31e9f385",
  paymentTypeCode: "CP",
};

export const paymentMethodInfo: PaymentMethodInfo = {
  title: "· · · · 4242",
  body: "12/30",
  icon: "visa",
};

export const pspSelected: Bundle = {
  abi: "33111",
  bundleDescription: "Pagamenti con carte",
  bundleName: "Worldline Merchant Services Italia S.p.A.",
  idBrokerPsp: "05963231005",
  idBundle: "98d24e9a-ab8b-48e3-ae84-f0c16c64db3b",
  idChannel: "05963231005_01",
  idPsp: "BNLIITRR",
  onUs: false,
  paymentMethod: "CP",
  taxPayerFee: 95,
  touchpoint: "CHECKOUT",
  pspBusinessName: "Worldline",
};

export const cardBrandAssets = {
  AMEX: "https://assets.cdn.platform.pagopa.it/creditcard/amex.png",
  DINERS: "https://assets.cdn.platform.pagopa.it/creditcard/diners.png",
  MAESTRO: "https://assets.cdn.platform.pagopa.it/creditcard/maestro.png",
  MASTERCARD: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
  MC: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
  VISA: "https://assets.cdn.platform.pagopa.it/creditcard/visa.png",
};

export const calculateFeeResponse: CalculateFeeResponse = {
  paymentMethodName: "CARDS",
  paymentMethodDescription: "Carte di Credito e Debito",
  paymentMethodStatus: PaymentMethodStatusEnum.ENABLED,
  belowThreshold: false,
  bundles: [
    {
      abi: "32875",
      bundleDescription:
        "Il Servizio consente di eseguire pagamenti a favore delle PA con carte Nexi sui circuiti Visa, VPAY, Mastercard e Maestro.",
      bundleName: "Nexi",
      idBrokerPsp: "13212880150",
      idBundle: "3c462358-ba2a-4716-827c-b356dcda9b67",
      idChannel: "13212880150_02",
      idPsp: "CIPBITMM",
      onUs: false,
      paymentMethod: "CP",
      taxPayerFee: 200,
      touchpoint: "CHECKOUT",
      pspBusinessName: "Nexi",
    },
    {
      abi: "01030",
      bundleDescription: "CANALE04NPG",
      bundleName: "Fascia2uat",
      idBrokerPsp: "00884060526",
      idBundle: "3fb25abb-5b20-4dac-b98d-7f801c6d35e4",
      idChannel: "00884060526_04",
      idPsp: "PASCITMM",
      onUs: false,
      paymentMethod: "CP",
      taxPayerFee: 200,
      touchpoint: "CHECKOUT",
      pspBusinessName: "Banca Monte dei Paschi di Siena S.p.A",
    },
  ],
  asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
  brandAssets: cardBrandAssets,
};

export const calculateFeeResponseOnlyOnePSP: CalculateFeeResponse = {
  paymentMethodName: "CARDS",
  paymentMethodDescription: "Carte di Credito e Debito",
  paymentMethodStatus: PaymentMethodStatusEnum.ENABLED,
  belowThreshold: false,
  bundles: [
    {
      abi: "32875",
      bundleDescription:
        "Il Servizio consente di eseguire pagamenti a favore delle PA con carte Nexi sui circuiti Visa, VPAY, Mastercard e Maestro.",
      bundleName: "Nexi",
      idBrokerPsp: "13212880150",
      idBundle: "3c462358-ba2a-4716-827c-b356dcda9b67",
      idChannel: "13212880150_02",
      idPsp: "CIPBITMM",
      onUs: false,
      paymentMethod: "CP",
      taxPayerFee: 200,
      touchpoint: "CHECKOUT",
      pspBusinessName: "Nexi",
    },
  ],
  asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
  brandAssets: cardBrandAssets,
};

export const calculateFeeResponseNoPsp: CalculateFeeResponse = {
  paymentMethodName: "CARDS",
  paymentMethodDescription: "Carte di Credito e Debito",
  paymentMethodStatus: PaymentMethodStatusEnum.ENABLED,
  belowThreshold: false,
  bundles: [],
  asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
  brandAssets: cardBrandAssets,
};

export const paymentInfo: PaymentInfo = {
  amount: 12000 as AmountEuroCents,
  paymentContextCode: "ff368bb048fa4e1daa2a297e1a9fd353",
  rptId: "77777777777302000100000009488" as RptId,
  paFiscalCode: "77777777777",
  paName: "companyName",
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
};

export const paymentInfoWIthFormattedAmount = {
  amount: "120,00 €",
  paymentContextCode: "ff368bb048fa4e1daa2a297e1a9fd353",
  rptId: "77777777777302000100000009488" as RptId,
  paFiscalCode: "77777777777",
  paName: "companyName",
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
};

export const sessionPayment: SessionPaymentMethodResponse = {
  sessionId: "4c15c2aa-3bd9-45d2-b06e-73525983b87b",
  bin: "42424242",
  lastFourDigits: "4242",
  expiringDate: "12/30",
  brand: "VISA",
};

const returnUrls: CartRequestReturnUrls = {
  returnOkUrl: "http://okUrl",
  returnCancelUrl: "http://cancelUrl",
  returnErrorUrl: "http://errorUrl",
};

export const cart: Cart = {
  emailNotice: "test@test.it",
  idCart: "idCart",
  paymentNotices: [
    {
      noticeNumber: "302034567876500000",
      fiscalCode: "77777777777",
      amount: 100,
    },
  ] as Array<PaymentNotice>,
  returnUrls,
};

export const createSuccessGetPaymentMethodsV1: PaymentMethodsResponse = {
  paymentMethods: [
    {
      asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
      brandAssets: cardBrandAssets,
      description: "Carte",
      id: "3ebea7a1-2e77-4a1b-ac1b-3aca0d67f813",
      methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
      name: "Carte",
      paymentTypeCode: "CP",
      ranges: [
        {
          max: 999999 as NonNegativeInteger,
          min: 0 as NonNegativeInteger,
        },
      ],
      status: PaymentMethodStatusEnum.ENABLED,
    } as PaymentMethodResponse,
    {
      asset: "https://assets.cdn.io.italia.it/logos/apps/paga-con-postepay.png",
      description: "Paga con Postepay",
      id: "1c12349f-8133-42f3-ad96-7e6527d27a41",
      methodManagement: PaymentMethodManagementTypeEnum.REDIRECT,
      name: "Paga con Poste Pay",
      paymentTypeCode: "RBPP",
      ranges: [
        {
          max: 999999 as NonNegativeInteger,
          min: 0 as NonNegativeInteger,
        },
      ],
      status: PaymentMethodStatusEnum.ENABLED,
    } as PaymentMethodResponse,
  ],
};

export const createSuccessGetPaymentMethodsV3: PaymentMethodsResponseV3 = {
  paymentMethods: [
    {
      asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
      brandAssets: cardBrandAssets,
      description: "Carte",
      id: "3ebea7a1-2e77-4a1b-ac1b-3aca0d67f813",
      methodManagement: PaymentMethodManagementTypeEnumV3.ONBOARDABLE,
      name: "Carte",
      paymentTypeCode: "CP",
      ranges: [
        {
          max: 999999 as NonNegativeInteger,
          min: 0 as NonNegativeInteger,
        },
      ],
      status: PaymentMethodStatusEnumV3.ENABLED,
    } as PaymentMethodResponseV3,
    {
      asset: "https://assets.cdn.io.italia.it/logos/apps/paga-con-postepay.png",
      description: "Paga con Postepay",
      id: "1c12349f-8133-42f3-ad96-7e6527d27a41",
      methodManagement: PaymentMethodManagementTypeEnumV3.REDIRECT,
      name: "Paga con Poste Pay",
      paymentTypeCode: "RBPP",
      ranges: [
        {
          max: 999999 as NonNegativeInteger,
          min: 0 as NonNegativeInteger,
        },
      ],
      status: PaymentMethodStatusEnumV3.ENABLED,
    } as PaymentMethodResponseV3,
  ],
};

export const rptId: PaymentFormFields = {
  billCode: "302034567870000000",
  cf: "77777777777",
};

export const createSuccessGetWallets: Array<WalletInfo> = [
  {
    walletId: "11111111-1111-1111-1111-111111111111" as WalletId,
    paymentMethodId: "pm_1",
    paymentMethodAsset: "http://logo.cdn/brandLogo1",
    status: WalletStatusEnum.VALIDATED,
    creationDate: new Date(),
    updateDate: new Date(),
    applications: [
      { name: "APP1", status: "ENABLED" } as WalletApplicationInfo,
    ],
    clients: {
      IO: { status: WalletClientStatusEnum.ENABLED },
    },
    details: {
      type: "CARDS",
      brand: "VISA",
      lastFourDigits: "1234",
      expiryDate: "203012",
    } as WalletInfoDetails,
  },

  {
    walletId: "22222222-2222-2222-2222-222222222222" as WalletId,
    paymentMethodId: "pm_2",
    paymentMethodAsset: "http://logo.cdn/brandLogo2",
    status: WalletStatusEnum.VALIDATED,
    creationDate: new Date(),
    updateDate: new Date(),
    applications: [
      { name: "APP2", status: "DISABLED" } as WalletApplicationInfo,
    ],
    clients: {
      IO: { status: WalletClientStatusEnum.DISABLED },
    },
    details: {
      type: "PAYPAL",
      pspId: "psp_123",
      pspBusinessName: "PayPal Business",
      maskedEmail: "test***@***test.it",
    } as WalletInfoDetails,
  },
];
