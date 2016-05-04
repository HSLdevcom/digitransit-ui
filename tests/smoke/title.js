'use strict'

module.exports = {

    'Page should have title Rutebanken': function(browser) {
        browser
            .url(browser.launch_url)
            .assert.containsText(".title", "Rutebanken")
            .end();
    }
};
