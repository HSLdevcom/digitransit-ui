module.exports = {
  tags: ['terminals', 'map', 'geolocation'],
  'Open Kamppi cluster, select stop to show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.169546, 24.931658);
    const messagebar = browser.page.messageBar();
    messagebar.close();

    browser.debug('Waiting a while for tiles to load');
    browser.pause(5000);
    const marker = browser.page.marker();
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneHeaderVisible();

    const stop = browser.page.stopCard();
    stop.waitForElementVisible('@cluster', browser.globals.itinerarySearchTimeout);
    stop.click('@clusterStop');
    // stop.expectCardHeaderDescription('Kamppi');
    stop.waitForDepartureVisible();
    stop.navigateToStopPage();
    const stopPage = browser.page.stop();
    stopPage.expectStopName('Kamppi');

    browser.end();
  },
};
