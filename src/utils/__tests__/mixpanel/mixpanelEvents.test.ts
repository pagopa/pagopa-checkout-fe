import { ViewOutcomeEnum } from "../../../utils/transactions/TransactionResultUtil";
import {
  MixpanelEventsId,
  MixpanelEventCategory,
  MixpanelEventType,
  MixpanelDataEntryType,
  mixpanelDataEntryTypeFromString,
  MixpanelFlow,
  MixpanelPaymentPhase,
  eventViewOutcomeMap,
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

describe("eventViewOutcomeMap", () => {
  test("should map ViewOutcomeEnum to MixpanelEventsId correctly", () => {
    expect(eventViewOutcomeMap[ViewOutcomeEnum.SUCCESS]).toBe(
      MixpanelEventsId.CHK_PAYMENT_UX_SUCCESS
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.AUTH_ERROR]).toBe(
      MixpanelEventsId.AUTH_ERROR
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.INVALID_DATA]).toBe(
      MixpanelEventsId.INVALID_DATA
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.TIMEOUT]).toBe(
      MixpanelEventsId.TIMEOUT
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.CIRCUIT_ERROR]).toBe(
      MixpanelEventsId.CIRCUIT_ERROR
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.MISSING_FIELDS]).toBe(
      MixpanelEventsId.MISSING_FIELDS
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.INVALID_CARD]).toBe(
      MixpanelEventsId.INVALID_CARD
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.CANCELED_BY_USER]).toBe(
      MixpanelEventsId.CANCELED_BY_USER
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.EXCESSIVE_AMOUNT]).toBe(
      MixpanelEventsId.EXCESSIVE_AMOUNT
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.REFUNDED]).toBe(
      MixpanelEventsId.REFUNDED
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.PSP_ERROR]).toBe(
      MixpanelEventsId.PSP_ERROR
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.BALANCE_LIMIT]).toBe(
      MixpanelEventsId.BALANCE_LIMIT
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.LIMIT_EXCEEDED]).toBe(
      MixpanelEventsId.LIMIT_EXCEEDED
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.INVALID_METHOD]).toBe(
      MixpanelEventsId.INVALID_METHOD
    );
    expect(eventViewOutcomeMap[ViewOutcomeEnum.TAKING_CHARGE]).toBe(
      MixpanelEventsId.TAKING_CHARGE
    );
  });

  test("should return undefined for unmapped ViewOutcomeEnum", () => {
    const fakeEnumValue = "__UNKNOWN__" as ViewOutcomeEnum;
    expect(eventViewOutcomeMap[fakeEnumValue]).toBeUndefined();
  });
});
