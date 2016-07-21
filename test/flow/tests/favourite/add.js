'use strict'


module.exports = {
    tags:  ['favourite'],
    "Add HSL address as favourite": function(browser) {
        var browser = browser.url(browser.launch_url);
        var myFavourites = browser.page.myFavourites();
        var favouriteName = "HSL"
        myFavourites.saveHomeFavourite("Opastinsilta 6, Helsinki", favouriteName);
        browser.page.feedback().close();
        myFavourites.verifyFirstHeader(favouriteName);
        browser.end();
    }
}
