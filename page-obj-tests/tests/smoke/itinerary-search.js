'use strict'

module.exports = {
    '@tags': ['smoke'],
    'From Hausmanns gate to Malerhaugveien 28': function(browser) {
        var browser = browser.url(browser.launch_url);
        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Hausmanns gate", "Malerhaugveien 28, Oslo");
        browser.page.itinerarySummary().waitForFirstItineraryRow();
        browser.end();
    }
}
