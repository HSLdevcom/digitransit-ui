

module.exports = {

    'Verify that we get a result from itinerary search' : function (browser) {
      browser
        .url(browser.launch_url)
        .waitForElementVisible('#front-page-search-bar', browser.globals.elementVisibleTimeout)
        .click('#front-page-search-bar')

        .waitForElementVisible('#origin', browser.globals.elementVisibleTimeout)
        .click('#origin')
        .waitForElementVisible('#search-origin', browser.globals.elementVisibleTimeout)
        .setValue('#search-origin', "Hausmanns gate")
        .pause(1000) //wait for suggestions
        .setValue('#search-origin', browser.Keys.ENTER)

        .waitForElementVisible('#front-page-search-bar', browser.globals.elementVisibleTimeout)
        .click('#front-page-search-bar')

        .waitForElementVisible('#destination', browser.globals.elementVisibleTimeout)
        .click("#destination")
        .waitForElementVisible('#search-destination', browser.globals.elementVisibleTimeout)
        .setValue('#search-destination', "Malerhaugveien 28, Oslo")
        .pause(1000) //wait for suggestions
        .setValue('#search-destination', browser.Keys.ENTER)
        
        .waitForElementVisible(".itinerary-summary-row", browser.globals.itinerarySearchTimeout)
        .end();
    }
}
