'use strict'

module.exports = {
    tags: ['nearby'],
    'Nearby routes': function(browser) {
        var browser = browser.url(browser.launch_url+"?mock");

        browser.execute(function() {
          window.mock.geolocation.setCurrentPosition(58.433448, 8.713419 );
        });

        browser.page.nearby()
          .openNearbyRoutes()
          .waitForRoutes();
        browser.end();
    }
};
