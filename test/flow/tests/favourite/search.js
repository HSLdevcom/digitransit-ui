'use strict'

module.exports = {
    tags:  ['favourite', 'search'],
    "Favourite should be part of search": function(browser) {
        var browser = browser.url(browser.launch_url);

        var myFavourites = browser.page.myFavourites();
        var favouriteName = "A favourite that should show up in search results";
        myFavourites.saveHomeFavourite("Opastinsilta 6, Helsinki", favouriteName);
        browser.page.feedback().close();

        var searchFields = browser.page.searchFields();

        searchFields.setDestination("");

        myFavourites.verifyFavouriteInSearchResult(favouriteName);
        browser.end();
    }
}
