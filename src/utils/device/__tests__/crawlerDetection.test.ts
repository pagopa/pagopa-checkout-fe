import { isCrawler } from "../crawlerDetection";

describe("isCrawler", () => {
  const originalUserAgent = navigator.userAgent;

  const setUserAgent = (value: string) => {
    Object.defineProperty(navigator, "userAgent", {
      value,
      configurable: true,
    });
  };

  afterEach(() => {
    setUserAgent(originalUserAgent);
  });

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; Google-InspectionTool/1.0)",
    "facebookexternalhit/1.1",
    "Twitterbot/1.0",
    "Mozilla/5.0 (compatible; YandexBot/3.0)",
    "Mozilla/5.0 (compatible; Baiduspider/2.0)",
    "Mozilla/5.0 (compatible; Applebot/0.1)",
  ])("should return true for crawler user agent: %s", (userAgent) => {
    setUserAgent(userAgent);
    expect(isCrawler()).toBe(true);
  });

  it.each([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  ])("should return false for real browser user agent: %s", (userAgent) => {
    setUserAgent(userAgent);
    expect(isCrawler()).toBe(false);
  });

  it("should return false when user agent is empty", () => {
    setUserAgent("");
    expect(isCrawler()).toBe(false);
  });
});
