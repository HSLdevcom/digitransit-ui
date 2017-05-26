module.exports = {
  tags: ['stops', 'map', 'geolocation'],
  'Open Ruoholahden villat cluster, select stop and go to timetable tab to see all todays departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.1659488, 24.92693);

    const marker = browser.page.marker();
    browser.debug('Waiting a while for tiles to load');
    marker.waitForVectorLayerLoaded();
    browser.pause(1000);
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneHeaderVisible();

    const stop = browser.page.stopCard();
    stop.waitForElementVisible('@cluster', browser.globals.itinerarySearchTimeout);
    stop.waitForElementVisible('@clusterStop', browser.globals.itinerarySearchTimeout);
    stop.click('@clusterStop');
    stop.waitForElementVisible('@clusterLink', browser.globals.itinerarySearchTimeout);
    stop.click('@clusterLink');
    stop.expectCardHeaderDescription('Ruoholahdenkatu');
    stop.waitForElementVisible('@inactiveTab', browser.globals.itinerarySearchTimeout);
    stop.click('@inactiveTab');
    stop.waitForElementVisible('@timetable', browser.globals.itinerarySearchTimeout);
    stop.waitForElementVisible('@timetableRow', browser.globals.itinerarySearchTimeout);
    browser.end();
  },
};
