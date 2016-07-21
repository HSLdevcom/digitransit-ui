'use strict'

module.exports = {
    tags: ['geolocation'],
    'From my location nearby Central Railway Station to HSL': function(browser) {
        var browser = browser.url(browser.launch_url)
            .setGeolocation(60.1719, 24.9414);


        browser.page.searchFields()
            .useCurrentLocationInOrigin()
            .setDestination("Opastinsilta 6")
            .enterKeyDestination();

        browser.page.itinerarySummary()
            .waitForFirstItineraryRow();

        browser.end();
    }
};
