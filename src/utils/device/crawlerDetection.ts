/**
 * Detects if the current request comes from a search engine crawler/bot
 * (e.g. Googlebot, Bingbot) based on the user agent.
 *
 * This is used to keep page metadata (document title) in the default site
 * language (Italian) when a crawler renders the page, so that search engine
 * results are shown in Italian regardless of the crawler navigator language.
 *
 * Real users are NOT affected: they keep seeing the UI in their browser language.
 *
 * @returns true if the user agent matches a known crawler, false otherwise
 */
export const isCrawler = (): boolean => {
  if (typeof navigator === "undefined" || !navigator.userAgent) {
    return false;
  }

  const crawlerPattern =
    /bot|crawl|spider|slurp|bingpreview|googlebot|google-inspectiontool|adsbot|mediapartners|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|whatsapp|telegrambot|applebot|duckduckbot|baiduspider|yandex|sogou|exabot|ia_archiver/i;

  return crawlerPattern.test(navigator.userAgent);
};
