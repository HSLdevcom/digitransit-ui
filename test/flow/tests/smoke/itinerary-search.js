module.exports = {
  '@tags': ['smoke'],
  'From Hausmanns gate to Malerhaugveien 28': (browser) => {
    browser.url(browser.launch_url);
    browser.page.searchFields().itinerarySearch('Hausmanns gate', 'Malerhaugveien 28, Oslo');
    browser.page.itinerarySummary().waitForFirstItineraryRow();
    browser.end();
  },
};
