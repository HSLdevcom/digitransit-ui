'use strict'

module.exports = {
    tags: ['stops', 'search'],
    'Search for 1240 (Kamppi) and verify that the title is correct': function(browser) {
        var browser = browser.url(browser.launch_url);

        var searchFields = browser.page.searchFields();
        searchFields.setSearch("1240");

        var stopCard = browser.page.stopCard();

        stopCard.expectCardHeader("Kamppi");

        // stopCard.waitForDepartureVisible();
        browser.end();
    }
};
