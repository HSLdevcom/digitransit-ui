module.exports = {
  tags: ['stops', 'map', 'geolocation'],
  'Open Ruoholahden villat cluster, select stop to show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.1659488, 24.92693);

    // Wait for the tiles to be loaded
    browser.pause(2000);
    const marker = browser.page.marker();
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneVisible();

    const stop = browser.page.stopCard();
    stop.waitForElementVisible('@cluster', browser.globals.itinerarySearchTimeout);
    stop.click('@clusterStop');
    stop.expectCardHeaderDescription('Ruoholahdenkatu');
    stop.waitForDepartureVisible();

    browser.end();
  },
};
