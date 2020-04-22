module.exports = {
  '@disabled': true, // TODO: change this whenever citybike period starts/ends
  tags: ['citybike'],
  'Citybike tests should be disabled during winter period': browser => {
    const d = new Date();
    const month = d.getMonth() + 1;
    const winterMonths = [11, 12, 1, 2, 3];
    if (winterMonths.includes(month)) {
      browser.assert.fail('Citybike tests should be disabled in winter');
    }
  },

  "Citybikes are used when it's the only modality": browser => {
    browser.url('http://localhost:8080/?modes=WALK%2CCITYBIKE');

    browser.page.searchFields().itinerarySearch('Katajanokka', 'Kauppatori');

    browser.page.itinerarySummary().waitForItineraryRowOfType('citybike');

    browser.end();
  },

  'Citybikes are not used when disabled': browser => {
    browser.url('http://localhost:8080/?modes=WALK');

    browser.page.searchFields().itinerarySearch('Katajanokka', 'Kauppatori');

    browser.page.itinerarySummary().waitForFirstItineraryRow();

    browser.page
      .itinerarySummary()
      .waitForItineraryRowOfTypeNotPresent('citybike');

    browser.end();
  },
};
