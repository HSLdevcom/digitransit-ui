'use strict'

module.exports = {
    tags: ['nearby', 'geolocation'],
    'I want to see nearby routes': function(browser) {
        var browser = browser.url(browser.launch_url + "?mock")
            .setGeolocation(58.433448, 8.713419);

        browser.page.nearby()
            .openNearbyRoutes()
            .waitForRoutes();

        browser.end();
    }
};
