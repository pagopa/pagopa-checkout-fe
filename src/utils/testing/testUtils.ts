import { PaymentInstrumentsType } from "../../features/payment/models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { PaymentMethodManagementTypeEnum } from "../../../generated/definitions/payment-ecommerce/PaymentMethodManagementType";
import { RptId } from "../../../generated/definitions/payment-ecommerce-v3/RptId";
import {
  MethodManagementEnum,
  PaymentTypeCodeEnum,
} from "../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";

export const paymentMethodsMock: Array<PaymentInstrumentsType> = [
  {
    id: "card-id",
    name: { it: "CARDS" },
    description: { it: "Carte di Credito e Debito" },
    status: PaymentMethodStatusEnum.ENABLED,
    methodManagement: MethodManagementEnum.ONBOARDABLE,
    paymentTypeCode: PaymentTypeCodeEnum.CP,
    feeRange: { min: 10, max: 10 },
    asset: undefined,
    brandAsset: undefined,
  },
  {
    id: "bancomatpay-id",
    name: { it: "BANCOMATPAY" },
    description: { it: "BancomatPay" },
    status: PaymentMethodStatusEnum.ENABLED,
    methodManagement: MethodManagementEnum.ONBOARDABLE,
    paymentTypeCode: PaymentTypeCodeEnum.BPAY,
    feeRange: { min: 10, max: 10 },
    asset: undefined,
    brandAsset: undefined,
  },
];

export const mockApiConfig = {
  CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
  CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
  CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/v2",
  CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/v3",
  CHECKOUT_API_ECOMMERCE_BASEPATH_V4: "/v4",
  CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/feature-flags",
  CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/auth-service",
  CHECKOUT_API_TIMEOUT: 5000,
};

export const paymentMethodResponseMock = [
  {
    name: "CARDS",
    description: "Carte di Credito e Debito",
    status: "ENABLED",
    methodManagement: "ONBOARDABLE",
    paymentTypeCode: "CP",
  },
];

export const calculateFeeResponseMock = {
  paymentMethodName: "CARDS",
  paymentMethodDescription: "Carte di Credito e Debito",
  paymentMethodStatus: "ENABLED",
  belowThreshold: false,
  bundles: [
    {
      abi: "test9",
      bundleDescription: "TestMil desc",
      bundleName: "Test MIL",
      idBrokerPsp: "pagopamil01",
      idBundle: "0caacf7f-e833-4906-ad2e-dd149a0c3232",
      idChannel: "pagopamil01_01",
      idPsp: "TMIL0101",
      onUs: false,
      paymentMethod: "CP",
      taxPayerFee: 50,
      touchpoint: "ANY",
      pspBusinessName: "TestMil",
    },
  ],
  asset: "asset",
};

export const sessionItemNoticeInfoMock = {
  billCode: "302011511242515601",
  cf: "77777777777",
};

export const sessionItemPaymentInfoMock = {
  amount: 12000,
  paymentContextCode: "dcc9620e314f4f5abfb8dbfd83af0397",
  rptId: "77777777777302011511242515601",
  paFiscalCode: "77777777777",
  paName: "companyName",
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
};

export const sessionItemTransactionMock = {
  transactionId: "12345",
  status: "ACTIVATED",
  payments: [
    {
      paymentToken: "12345",
      rptId: "77777777777302011511243515601" as RptId,
      reason: "Reason",
      amount: 12000,
      transferList: [
        {
          paFiscalCode: "77777777777",
          digitalStamp: false,
          transferCategory: "0101101IM",
          transferAmount: 10000,
        },
        {
          paFiscalCode: "01199250158",
          digitalStamp: false,
          transferCategory: "0201102IM",
          transferAmount: 2000,
        },
      ],
      isAllCCP: false,
    },
  ],
  clientId: "CHECKOUT",
  authToken: "authToken",
};

export const postSessionResponseMock = {
  orderId: "orderId",
  correlationId: "00000000-1e99-4d88-8798-fdba8b78255c",
  paymentMethodData: {
    paymentMethod: "CARDS",
    form: [
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "CARD_NUMBER",
        src: "src",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "EXPIRATION_DATE",
        src: "src",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "SECURITY_CODE",
        src: "src",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "CARDHOLDER_NAME",
        src: "src",
      },
    ],
  },
};

export const cardPaymentMethodMock = {
  paymentMethodId: "e7058cac-5e1a-4002-8994-5bab31e9f385",
  paymentTypeCode: "CP",
};

export const getPaymentRequestInfoResponseMock = {
  amount: 12000,
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
  paFiscalCode: "77777777777",
  paName: "Pagamento di Test",
  rptId: "77777777777302012387654312300",
};

export const getCartResponseMock = {
  emailNotice: "myemail@mail.it",
  idCart: "ecCartIdExample",
  paymentNotices: [
    {
      amount: 1000,
      companyName: "test1",
      description: "test1",
      fiscalCode: "77777777777",
      noticeNumber: "302012387654312300",
    },
    {
      amount: 2000,
      companyName: "test2",
      description: "test2",
      fiscalCode: "77777777777",
      noticeNumber: "302012387654312301",
    },
    {
      amount: 3000,
      companyName: "test3",
      description: "test3",
      fiscalCode: "77777777777",
      noticeNumber: "302012387654312302",
    },
    {
      amount: 4000,
      companyName: "test4",
      description: "test4",
      fiscalCode: "77777777777",
      noticeNumber: "302012387654312303",
    },
    {
      amount: 5000,
      companyName: "test5",
      description: "test5",
      fiscalCode: "77777777777",
      noticeNumber: "302012387654312304",
    },
  ],
  returnUrls: {
    returnCancelUrl: "https://www.comune.di.prova.it/pagopa/cancel.html",
    returnErrorUrl: "https://www.comune.di.prova.it/pagopa/error.html",
    returnOkUrl: "https://www.comune.di.prova.it/pagopa/success.html",
  },
};

export const transactionResponseMock = {
  transactionId: "7507a3aee3d04fa49e575ff57ba6be7a",
  status: "ACTIVATED",
  payments: [
    {
      paymentToken: "7fe9080d6593408c802ed0dc71c492f7",
      rptId: "77777777777302011511242515601",
      reason: "TARI/TEFA 2021",
      amount: 12000,
      transferList: [
        {
          paFiscalCode: "77777777777",
          digitalStamp: false,
          transferCategory: "0101101IM",
          transferAmount: 10000,
        },
        {
          paFiscalCode: "01199250158",
          digitalStamp: false,
          transferCategory: "0201102IM",
          transferAmount: 2000,
        },
      ],
      isAllCCP: false,
    },
  ],
  clientId: "CHECKOUT",
  authToken: "authToken",
};
