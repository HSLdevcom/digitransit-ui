'use strict'

module.exports = {
    tags: ['stops', 'map', 'skip'],
    'Click any bus stop place marker in map and show its departures': function(browser) {
        var browser = browser.url(browser.launch_url);

        var zoom = browser.page.zoom();
        zoom.zoomIn(5);

        var marker = browser.page.marker();
        marker.clickAnyBusStopMarker();
        marker.waitForPopupPaneVisible();

        var stopCard = browser.page.stopCard();
        // TODO: Enable when route data is present for stops in map.
        // stopCard.waitForDepartureVisible();

        browser.end();
    }
};