module.exports = {
  tags: ['geolocation'],
  'From my location at HSL to Central Railway Station': browser => {
    browser.url(browser.launch_url);

    browser.page.searchFields().selectDestination('Rautatieasema, Helsinki');

    browser.page.itinerarySummary().waitForFirstItineraryRow();

    browser.end();
  },
};
