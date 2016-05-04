'use strict'

module.exports = {
    tags: ['stops', 'search'],
    'Search for Tanangerhallen and verify that the title is correct': function(browser) {
        var browser = browser.url(browser.launch_url);

        var searchFields = browser.page.searchFields();
        searchFields.setSearch("Tanangerhallen");

        var stopCard = browser.page.stopCard();

        stopCard.expectCardHeader("Tanangerhallen");

        // stopCard.waitForDepartureVisible();
        browser.end();
    }
};