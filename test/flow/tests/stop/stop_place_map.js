module.exports = {
  tags: ['stops', 'map', 'geolocation'],
  'Open Kamppi cluster, select stop to show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.1692, 24.9318);

    const marker = browser.page.marker();
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneVisible();

    const stop = browser.page.stopCard();
    stop.waitForElementVisible('@cluster', browser.globals.itinerarySearchTimeout);
    stop.click('@clusterStop');
    stop.expectCardHeader('Kamppi');
    stop.waitForDepartureVisible();

    browser.end();
  },
};
