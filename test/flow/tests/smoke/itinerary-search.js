module.exports = {
  '@tags': ['smoke'],
  'From Hausmanns gate to Munkkirinne': (browser) => {
    browser.url(browser.launch_url);
    browser.page.searchFields().itinerarySearch('Mannerheim museo', 'Munkkirinne');
    browser.page.itinerarySummary().waitForFirstItineraryRow();
    browser.end();
  },
};
