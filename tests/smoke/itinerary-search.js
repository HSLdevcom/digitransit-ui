'use strict'

var searchHelper = require("../../helpers/search-helper");

module.exports = {
    'Itinerary search from Hausmanns gate to Malerhaugveien 28' : function (browser) {
      var browser = browser.url(browser.launch_url);
      searchHelper.waitingItinerarySearch(browser, "Hausmanns gate", "Malerhaugveien 28, Oslo");
      browser.end();
    },
    'Itinerary search from Hausmanns gate to Ula nord' : function (browser) {
      var browser = browser.url(browser.launch_url);
      searchHelper.waitingItinerarySearch(browser, "Hausmanns gate", "Ula nord");
      browser.end();
    },
    'Itinerary search from Røros skole to Festplassen, Bergen' : function (browser) {
      var browser = browser.url(browser.launch_url);
      searchHelper.waitingItinerarySearch(browser, "Røros skole", "Festplassen");
      browser.end();
    },
    'Itinerary search from Festplassen, Bergen to Scandic Alta' : function (browser) {
      var browser = browser.url(browser.launch_url);
      searchHelper.waitingItinerarySearch(browser, "Festplassen", "Scandic Alta");
      browser.end();
    }
}
