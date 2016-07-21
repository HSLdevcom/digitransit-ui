'use strict'


module.exports = {
    tags:  ['favourite'],
    "Add my home address as favourite": function(browser) {
        var browser = browser.url(browser.launch_url);
        var myFavourites = browser.page.myFavourites();
        var favouriteName = "Home sweet home"
        myFavourites.saveHomeFavourite("Vestre vei 21, Asker", favouriteName);
        myFavourites.verifyFirstHeader(favouriteName);
        browser.end();
    }
}