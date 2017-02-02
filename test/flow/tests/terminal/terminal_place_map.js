module.exports = {
  tags: ['terminals', 'map', 'geolocation'],
  'Open Kamppi Terminal and show its departures': (browser) => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.169546, 24.931658);
//    const messagebar = browser.page.messageBar();
//    messagebar.close();
    const marker = browser.page.marker();
    browser.debug('Waiting a while for tiles to load');
    marker.waitForVectorLayerLoaded();
    browser.pause(1000);
    marker.clickSouthOfCurrentLocation();
    marker.waitForPopupPaneHeaderVisible();
    browser.debug('Popup should have loaded by now');

    /* This is little bit tricky!
     * If we click '.card .cursor-pointer' it seems that snap-ci somehow clicks aside of the popup
     * failed screenshot then shows 'wrong popup open'
     * Therefore we click 'deep inside popup' to make sure it actually works.
     * This commit fixes snap-ci:
     * https://github.com/HSLdevcom/digitransit-ui/commit/b69bee413933787fe7be72cb5fc25ae3230329e1
    */
    browser.debug('Click on popup');
    browser.checkedClick('span.time');
    const stop = browser.page.stopCard();
    stop.waitForDepartureVisible();
    const stopPage = browser.page.stop();
    stopPage.expectStopName('Kamppi (Espoon terminaali)');

    browser.end();
  },
};
