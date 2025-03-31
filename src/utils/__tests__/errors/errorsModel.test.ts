import { FaultCategoryEnum } from "../../../../generated/definitions/payment-ecommerce/FaultCategory";
import { PaymentCategoryResponses, ErrorModalBtn } from "../../errors/errorsModel";

const HELPDESK_URL = "https://www.pagopa.gov.it/it/helpdesk/";

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe("errorsModel", () => {
  beforeEach(() => {
    jest.spyOn(window, 'open').mockImplementation(() => {
      return { focus: jest.fn() } as unknown as Window;
    });
  });

  it("should have a response for each FaultCategory", () => {
    const faultCategories = Object.values(FaultCategoryEnum);

    faultCategories.forEach(category => {
      expect(PaymentCategoryResponses[category]).toBeDefined();
    });
  });

  it("each response should have required properties", () => {
    Object.values(FaultCategoryEnum).forEach(category => {
      const response = PaymentCategoryResponses[category];

      expect(response).toHaveProperty("title");
      expect(typeof response.title).toBe("string");

      if (response.buttons) {
        response.buttons.forEach((button: ErrorModalBtn) => {
          expect(button).toHaveProperty("title");
        });
      }
    });
  });

  it("help button should open the helpdesk URL in a new tab", () => {
    [
      FaultCategoryEnum.DOMAIN_UNKNOWN,
      FaultCategoryEnum.PAYMENT_UNAVAILABLE,
      FaultCategoryEnum.PAYMENT_DATA_ERROR,
      FaultCategoryEnum.GENERIC_ERROR
    ].forEach(category => {
      const response = PaymentCategoryResponses[category];
      const helpButton = response.buttons?.find((btn: ErrorModalBtn) => btn.title === "errorButton.help");

      expect(helpButton).toBeDefined();
      expect(helpButton?.action).toBeDefined();

      helpButton?.action && helpButton.action();

      expect(window.open).toHaveBeenCalledWith(HELPDESK_URL, "_blank");
    });
  });

  it("close button should not have an action", () => {
    [
      FaultCategoryEnum.PAYMENT_DUPLICATED,
      FaultCategoryEnum.PAYMENT_ONGOING,
      FaultCategoryEnum.PAYMENT_EXPIRED,
      FaultCategoryEnum.PAYMENT_UNKNOWN,
      FaultCategoryEnum.PAYMENT_CANCELED
    ].forEach(category => {
      const response = PaymentCategoryResponses[category];
      const closeButton = response.buttons?.find((btn: ErrorModalBtn) => btn.title === "errorButton.close");

      expect(closeButton).toBeDefined();
      expect(closeButton?.action).toBeUndefined();
    });
  });

  describe("specific error categories", () => {
    it("GENERIC_ERROR should have correct structure", () => {
      const genericError = PaymentCategoryResponses[FaultCategoryEnum.GENERIC_ERROR];

      expect(genericError.title).toBe("GENERIC_ERROR.title");
      expect(genericError.detail).toBe(false);
      expect(genericError.body).toBe("GENERIC_ERROR.body");
      expect(genericError.buttons).toHaveLength(2);
    });

    it("PAYMENT_DUPLICATED should have correct structure", () => {
      const duplicatedError = PaymentCategoryResponses[FaultCategoryEnum.PAYMENT_DUPLICATED];

      expect(duplicatedError.title).toBe("PAYMENT_DUPLICATED.title");
      expect(duplicatedError.detail).toBe(false);
      expect(duplicatedError.body).toBe("PAYMENT_DUPLICATED.body");
      expect(duplicatedError.buttons).toHaveLength(1);
    });

    it("DOMAIN_UNKNOWN should have correct structure", () => {
      const unknownError = PaymentCategoryResponses[FaultCategoryEnum.DOMAIN_UNKNOWN];

      expect(unknownError.title).toBe("DOMAIN_UNKNOWN.title");
      expect(unknownError.detail).toBe(true);
      expect(unknownError.buttons).toHaveLength(2);
    });
  });
});