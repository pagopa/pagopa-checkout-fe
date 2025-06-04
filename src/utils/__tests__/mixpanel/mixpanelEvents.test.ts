import {
  MixpanelEventsId,
  MixpanelEventCategory,
  MixpanelEventType,
  MixpanelDataEntryType,
  mixpanelDataEntryTypeFromString,
  MixpanelFlow,
  MixpanelPaymentPhase,
} from "../../mixpanel/mixpanelEvents";

describe("MixpanelDataEntryType", () => {
  test("should return correct enum value for valid string", () => {
    expect(mixpanelDataEntryTypeFromString("qr_code")).toBe(
      MixpanelDataEntryType.QR_CODE
    );
    expect(mixpanelDataEntryTypeFromString("manual")).toBe(
      MixpanelDataEntryType.MANUAL
    );
  });

  test("should return undefined for invalid string", () => {
    expect(mixpanelDataEntryTypeFromString("invalid")).toBeUndefined();
    expect(mixpanelDataEntryTypeFromString("")).toBeUndefined();
  });
});

describe("MixpanelEventsId enum", () => {
  test("should contain specific event id", () => {
    expect(MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY).toBe(
      "CHK_PAYMENT_NOTICE_DATA_ENTRY"
    );
  });
});

describe("MixpanelEventCategory enum", () => {
  test("should have UX as value", () => {
    expect(MixpanelEventCategory.UX).toBe("UX");
  });
});

describe("MixpanelEventType enum", () => {
  test("should have correct values", () => {
    expect(MixpanelEventType.SCREEN_VIEW).toBe("screen view");
    expect(MixpanelEventType.ACTION).toBe("action");
  });
});

describe("MixpanelFlow enum", () => {
  test("should have correct values", () => {
    expect(MixpanelFlow.CART).toBe("cart");
    expect(MixpanelFlow.DATA_ENTRY).toBe("data_entry");
  });
});

describe("MixpanelPaymentPhase enum", () => {
  test("should have correct values", () => {
    expect(MixpanelPaymentPhase.VERIFICA).toBe("verifica");
    expect(MixpanelPaymentPhase.ATTIVA).toBe("attiva");
    expect(MixpanelPaymentPhase.PAGAMENTO).toBe("pagamento");
  });
});
