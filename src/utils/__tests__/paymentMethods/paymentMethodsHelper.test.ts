import { PaymentInstrumentsType } from "../../../features/payment/models/paymentModel";
import {
  getMethodDescriptionForCurrentLanguage,
  getMethodNameForCurrentLanguage,
} from "../../paymentMethods/paymentMethodsHelper";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
// eslint-disable-next-line functional/immutable-data
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("paymentMethodsHelper", () => {
  const createMockMethod = (
    description: Record<string, string>,
    name: Record<string, string>
  ): PaymentInstrumentsType =>
    ({
      description,
      name,
    } as PaymentInstrumentsType);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMethodDescriptionForCurrentLanguage", () => {
    it("should return description for current language when available", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("EN");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe("English Description");
    });

    it("should fallback to IT when localStorage returns null", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe("Italian Description");
    });

    it("should fallback to IT when current language key is not found", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("FR");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe("Italian Description");
    });

    it("should be case insensitive when matching language keys", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("en");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe("English Description");
    });

    it("should fallback to IT value when selected key has undefined value", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("EN");
      const method = createMockMethod(
        { IT: "Italian Description", EN: undefined as any },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe("Italian Description");
    });

    it("should handle empty description object by falling back to IT", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("EN");
      const method = createMockMethod({} as Record<string, string>, {
        IT: "Italian Name",
        EN: "English Name",
      });

      const result = getMethodDescriptionForCurrentLanguage(method);

      expect(result).toBe(undefined); // fallback to italian desctription which doesn't exist
    });
  });

  describe("getMethodNameForCurrentLanguage", () => {
    it("should return name for current language when available", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("EN");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodNameForCurrentLanguage(method);

      expect(result).toBe("English Name");
    });

    it("should fallback to IT when localStorage returns null", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodNameForCurrentLanguage(method);

      expect(result).toBe("Italian Name");
    });

    it("should fallback to IT when current language key is not found", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("FR");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodNameForCurrentLanguage(method);

      expect(result).toBe("Italian Name");
    });

    it("should be case insensitive when matching language keys", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("en");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: "English Name" }
      );

      const result = getMethodNameForCurrentLanguage(method);

      expect(result).toBe("English Name");
    });

    it("should fallback to IT value when selected key has undefined value", () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue("EN");
      const method = createMockMethod(
        { IT: "Italian Description", EN: "English Description" },
        { IT: "Italian Name", EN: undefined as any }
      );

      const result = getMethodNameForCurrentLanguage(method);

      expect(result).toBe("Italian Name");
    });
  });
});
