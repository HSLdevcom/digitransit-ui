'use strict'

var searchHelper = require("../../helpers/search-helper");

module.exports = {
    'Show itinerary instructions if suggestion chosen' : function (browser) {
      var browser = browser.url(browser.launch_url);
      searchHelper.setOrigin(browser, "Hausmanns gate");
      searchHelper.setDestination(browser, "Malerhaugveien 28, Oslo");
      searchHelper.waitForItineraryRow(browser);
      searchHelper.chooseFirstItinerarySuggestion(browser);
      browser.waitForElementVisible(".itinerary-instruction-column", browser.globals.itinerarySearchTimeout);
      browser.end();
    }
}
