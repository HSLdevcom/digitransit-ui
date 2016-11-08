module.exports = {
  tags: ['terminals', 'map', 'geolocation'],
  'Open Kamppi Terminal and show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.169546, 24.931658);
    const messagebar = browser.page.messageBar();
    messagebar.close();

    browser.debug('Waiting a while for tiles to load');
    browser.pause(5000);
    const marker = browser.page.marker();
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneHeaderVisible();
    browser.debug('Popup should have loaded by now');

    const stop = browser.page.stopCard();
    browser.debug('Click on popup');
    browser.checkedClick('.card .cursor-pointer');

    stop.waitForDepartureVisible();
    const stopPage = browser.page.stop();
    stopPage.expectStopName('Kamppi (Espoon terminaali)');

    browser.end();
  },
};
