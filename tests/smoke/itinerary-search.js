module.exports = {

    'Verify that we get a result from itinerary search' : function (browser) {
      browser
        .url(browser.launch_url)

        .waitForElementVisible('#origin', browser.globals.elementVisibleTimeout)
        .click('#origin')
        .pause(100)
        .setValue('#search-origin', "Hausmanns gate, Oslo")
        .pause(1000) //wait for suggestions
        .setValue('#search-origin', browser.Keys.ENTER)
        .pause(100) //wait for dialog to vanish
        .waitForElementVisible('#destination', browser.globals.elementVisibleTimeout)
        .click("#destination")
        .pause(100)
        .setValue('#search-destination', "Malerhaugveien 28, Oslo")
        .pause(1000) //wait for suggestions
        .setValue('#search-destination', browser.Keys.ENTER)
        .pause(100) //wait for dialog to vanish
        .waitForElementVisible(".itinerary-summary-row", browser.globals.itinerarySearchTimeout)
        .end();
    }
}
