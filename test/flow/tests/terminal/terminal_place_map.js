module.exports = {
  '@disabled': true,
  tags: ['terminals', 'map', 'geolocation'],
  'Open Kamppi Terminal and show its departures': browser => {
    browser.url('http://127.0.0.1:8080/HSL::60.169546,24.931658/-');
    browser.debug('Waiting a while for tiles to load');
    const marker = browser.page.marker();
    marker.waitForVectorLayerLoaded();
    marker.clickSouthOfPlaceMarker();
    marker.waitForPopupPaneHeaderVisible();
    browser.debug('Popup should have loaded by now');

    // This test is tricky because 2 different popups open almost from the same location.
    // Terminal icon's top edge opens directly the terminal popup, so let's assume that.
    // This test will surely break again sooner or later
    browser.debug('Click on popup');
    browser.checkedClick('span.header-primary');
    const stop = browser.page.stopCard();
    stop.waitForDepartureVisible();
    const stopPage = browser.page.stop();
    stopPage.expectStopName('Kamppi (lähiliikenneterminaali)');

    browser.end();
  },
};
