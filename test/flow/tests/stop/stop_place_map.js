'use strict'

module.exports = {
    tags: ['stops', 'map', 'geolocation'],
    'Click any bus stop place marker in map and show its departures': function(browser) {
        var browser = browser.url(browser.launch_url);
        browser.setGeolocation(60.1692, 24.9318);

        var marker = browser.page.marker();
        marker.clickSouthOfCurrentLocation();
        marker.waitForPopupPaneVisible();

        var stopCard = browser.page.stopCard();
        // TODO: Enable when route data is present for stops in map.
        // stopCard.waitForDepartureVisible();

        browser.end();
    }
};
