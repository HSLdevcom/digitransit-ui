module.exports = {
  '@disabled': false,
  tags: ['walk'],
  'Walk in the park': browser => {
    browser.url('http://localhost:8080/?modes=WALK');

    browser.page
      .searchFields()
      .itinerarySearch('Helsingin rautatieasema', 'Kaisaniemen puisto');

    browser.page.itinerarySummary().waitForItineraryRowOfType('walk');
    browser.end();
  },
};
