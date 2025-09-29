import { PaymentInstrumentsType } from "../../features/payment/models/paymentModel";
import { getNormalizedMethods } from "../../features/payment/components/PaymentChoice/utils";

// Mock the paymentMethodsHelper
jest.mock("../../utils/paymentMethods/paymentMethodsHelper", () => ({
  getMethodDescriptionForCurrentLanguage: jest.fn(
    (method) => method.description?.it || method.description || "Unknown"
  ),
  getMethodNameForCurrentLanguage: jest.fn(
    (method) => method.name?.it || method.name || "Unknown"
  ),
}));

const PaymentCodeTypeEnum = {
  CP: "CP",
  Other1: "Other1",
  Other2: "Other2",
  Other3: "Other3",
};

const PaymentMethodStatusEnum = {
  ENABLED: "ENABLED",
  DISABLED: "DISABLED",
};

const paymentInstruments = [
  {
    paymentTypeCode: PaymentCodeTypeEnum.CP,
    status: PaymentMethodStatusEnum.ENABLED,
    description: "Method 1",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.Other1,
    status: PaymentMethodStatusEnum.ENABLED,
    description: "Method 2",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.CP,
    status: PaymentMethodStatusEnum.DISABLED,
    description: "Method 3",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.Other1,
    status: PaymentMethodStatusEnum.DISABLED,
    description: "Method 4",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.CP,
    status: PaymentMethodStatusEnum.ENABLED,
    description: "Method 5",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.Other2,
    status: PaymentMethodStatusEnum.ENABLED,
    description: "Method 6",
  },
  {
    paymentTypeCode: PaymentCodeTypeEnum.Other3,
    status: PaymentMethodStatusEnum.DISABLED,
    description: "Method 7",
  },
] as unknown as Array<PaymentInstrumentsType>;

describe("getNormalizedMethods", () => {
  test("returns enabled and disabled methods", () => {
    const result = getNormalizedMethods(paymentInstruments);
    expect(result.enabled.length).toBe(3);
    expect(result.disabled.length).toBe(1);
  });

  test("sorts enabled methods correctly", () => {
    const result = getNormalizedMethods(paymentInstruments);
    expect(result.enabled[0].description).toBe("Method 1");
    expect(result.enabled[1].description).toBe("Method 2");
  });

  test("sorts disabled methods correctly", () => {
    const result = getNormalizedMethods(paymentInstruments);
    expect(result.disabled[0].description).toBe("Method 7");
  });

  test("returns duplicated methods", () => {
    const result = getNormalizedMethods(paymentInstruments);
    expect(result.duplicatedMethods.length).toBe(3);
    expect(result.duplicatedMethods[0].description).toBe("Method 3");
  });
});
