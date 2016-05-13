'use strict'

module.exports = {
    tags: ['geolocation'],
    'From my location nearby Blommenholm stasjon to Bryn stasjon': function(browser) {
        var browser = browser.url(browser.launch_url)
            .setGeolocation(59.896442, 10.554464);


        browser.page.searchFields()
            .useCurrentLocationInOrigin()
            .setDestination("Bryn stasjon")
            .enterKeyDestination();

        browser.page.itinerarySummary()
            .waitForFirstItineraryRow();

        browser.end();
    }
};
