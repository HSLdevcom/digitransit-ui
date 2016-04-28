'use strict'

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

function chooseFirstItinerarySuggestion(browser) {
  return browser.click(".itinerary-summary-row:nth-of-type(1)");
}

function waitingItinerarySearch(browser, origin, destination) {
  setOrigin(browser, origin);
  setDestination(browser, destination);
  waitForItineraryRow(browser);
}

module.exports = {
    chooseFirstItinerarySuggestion: chooseFirstItinerarySuggestion,
    waitingItinerarySearch: waitingItinerarySearch,
    setOrigin: setOrigin,
    setDestination: setDestination,
    waitForItineraryRow: waitForItineraryRow
}
