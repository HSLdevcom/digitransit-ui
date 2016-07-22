module.exports = {
  tags: ['stops', 'map', 'geolocation'],
  'Click any bus stop place marker in map and show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.1692, 24.9318);

    const marker = browser.page.marker();
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneVisible();

    // TODO: Enable when route data is present for stops in map.
    //browser.page.stopCard().waitForDepartureVisible();

    browser.end();
  },
};
