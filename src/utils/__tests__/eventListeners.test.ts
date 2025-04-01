/* eslint-disable functional/no-let, functional/immutable-data */
import {
  onBrowserUnload,
  onBrowserBackEvent,
  clearNavigationEvents,
} from "../../utils/eventListeners";

let pushStateSpy: jest.SpyInstance;
let removeEventListenerSpy: jest.SpyInstance;
const originalLocation = window.location;

beforeAll(() => {
  delete (window as any).location;
  (window as any).location = {
    ...originalLocation,
    pathname: "/initial-path",
    assign: jest.fn(),
    replace: jest.fn(),
  };

  pushStateSpy = jest.spyOn(window.history, "pushState");
  removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
});

beforeEach(() => {
  pushStateSpy.mockClear();
  removeEventListenerSpy.mockClear();
  window.location.pathname = "/initial-path";
});

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  pushStateSpy = jest.spyOn(window.history, "pushState");
  removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
});

afterAll(() => {
  pushStateSpy.mockRestore();
  removeEventListenerSpy.mockRestore();

  delete (window as any).location;
  (window as any).location = originalLocation;
});

describe("eventListeners", () => {
  describe("onBrowserUnload", () => {
    it("should call preventDefault and set returnValue on the event object", async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: "initialValue",
      };

      const result = onBrowserUnload(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockEvent.returnValue).toBe("");
      expect(result).toBe("");
    });
  });

  describe("onBrowserBackEvent", () => {
    it("should call preventDefault and pushState with current pathname", async () => {
      window.location.pathname = "/test-path-back";
      const mockEvent = {
        preventDefault: jest.fn(),
      };

      onBrowserBackEvent(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/test-path-back");
    });
  });

  describe("clearNavigationEvents", () => {
    it("should remove popstate and beforeunload event listeners", async () => {
      clearNavigationEvents();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "popstate",
        onBrowserBackEvent
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        onBrowserUnload
      );
    });
  });
});
