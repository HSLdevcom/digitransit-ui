module.exports = {
  tags: ['favourite', 'search'],
  'Favourite should be part of search': browser => {
    browser.url(browser.launch_url);
    //    const messagebar = browser.page.messageBar();
    //    messagebar.close();
    const myFavourites = browser.page.myFavourites();
    const favouriteName = 'A favourite that should show up in search results';
    myFavourites.saveHomeFavourite('Opastinsilta 6, Helsinki', favouriteName);
    myFavourites.clickFavourites(); // should close favourites

    browser.page.searchFields().setDestination('');

    myFavourites.verifyFavouriteInSearchResult(favouriteName);
    browser.end();
  },
};
