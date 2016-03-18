module.exports = {

    'Verify that we get a result from itinerary search' : function (browser) {
      browser
        .url(browser.launch_url)

        //TODO: separate methods for setting destination and origin
        .waitForElementVisible('.address-box', browser.globals.elementVisibleTimeout)
        .click('.address-box')
        .pause(100)
        .setValue('#autosuggest-input', "Hausmanns gate, Oslo")
        .pause(1000) //wait for suggestions
        .setValue('#autosuggest-input', browser.Keys.ENTER)
        .pause(100) //wait for dialog to vanish
        .waitForElementVisible('#destination', browser.globals.elementVisibleTimeout)
        .click("#destination")
        .pause(100)
        .setValue('#autosuggest-input', "Malerhaugveien 28, Oslo")
        .pause(1000) //wait for suggestions
        .setValue('#autosuggest-input', browser.Keys.ENTER)
        .pause(100) //wait for dialog to vanish
        .waitForElementVisible(".itinerary-summary-row", browser.globals.itinerarySearchTimeout)
        .end();
    }
}
