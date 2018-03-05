module.exports = {
  tags: ['stops', 'map', 'geolocation'],
  'Open Ruoholahden villat cluster, select stop to show its departures': browser => {
    browser.url('http://127.0.0.1:8000/testipaikka::60.1659488,24.92693/-');

    const marker = browser.page.marker();
    browser.debug('Waiting a while for tiles to load');
    marker.waitForVectorLayerLoaded();
    marker.clickSouthOfPlaceMarker();
    marker.waitForPopupPaneHeaderVisible();

    const stop = browser.page.stopCard();
    stop.waitForElementVisible(
      '@cluster',
      browser.globals.itinerarySearchTimeout,
    );
    stop.click('@clusterStop');
    stop.expectCardHeaderDescription('Ruoholahdenkatu');
    stop.waitForDepartureVisible();

    browser.end();
  },
};
