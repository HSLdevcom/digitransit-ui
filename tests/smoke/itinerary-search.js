
// Todo separate module
function setOrigin(browser, origin) {
  return browser
          .waitForElementVisible('#front-page-search-bar', browser.globals.elementVisibleTimeout)
          .click('#front-page-search-bar')
          .waitForElementVisible('#origin', browser.globals.elementVisibleTimeout)
          .click('#origin')
          .waitForElementVisible('#search-origin', browser.globals.elementVisibleTimeout)
          .setValue('#search-origin', origin)
          .pause(1000) //wait for suggestions
          .waitForElementVisible("#react-autowhatever-suggest--item-0", browser.globals.elementVisibleTimeout)
          .setValue('#search-origin', browser.Keys.ENTER);
}

function setDestination(browser, destination) {
  return browser.waitForElementVisible('#front-page-search-bar', browser.globals.elementVisibleTimeout)
          .click('#front-page-search-bar')
          .waitForElementVisible('#destination', browser.globals.elementVisibleTimeout)
          .click("#destination")
          .waitForElementVisible('#search-destination', browser.globals.elementVisibleTimeout)
          .setValue('#search-destination', destination)
          .pause(1000) //wait for suggestions
          .setValue('#search-destination', browser.Keys.ENTER)
}

function waitForItineraryRow(browser) {
  return browser.waitForElementVisible(".itinerary-summary-row", browser.globals.itinerarySearchTimeout)
}

module.exports = {
    'Itinerary search from Hausmanns gate to Malerhaugveien 28' : function (browser) {
      var browser = browser.url(browser.launch_url);
      setOrigin(browser, "Hausmanns gate");
      setDestination(browser, "Malerhaugveien 28, Oslo");
      waitForItineraryRow(browser);
      browser.end();
    },
    'Itinerary search from Hausmanns gate to Ula nord' : function (browser) {
      var browser = browser.url(browser.launch_url);
      setOrigin(browser, "Hausmanns gate");
      setDestination(browser, "Ula nord");
      waitForItineraryRow(browser);
      browser.end();
    },
    'Itinerary search from Røros skole to Festplassen, Bergen' : function (browser) {
      var browser = browser.url(browser.launch_url);
      setOrigin(browser, "Røros skole");
      setDestination(browser, "Festplassen");
      waitForItineraryRow(browser);
      browser.end();
    }
    /* Because of issues with route data, the following test is commented out.
       Try to use another time for the itinerary search.
    */

    /*,
    'Itinerary search from Festplassen, Bergen to Scandic Alta' : function (browser) {
      var browser = browser.url(browser.launch_url);
      setOrigin(browser, "Festplassen");
      setDestination(browser, "Scandic Alta");
      waitForItineraryRow(browser);
      browser.end();
    }*/

}
