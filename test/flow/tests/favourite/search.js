module.exports = {
  '@disabled': true,
  tags: ['favourite', 'search'],
  'Favourite should be part of search': browser => {
    browser.url(browser.launch_url);
    //    const messagebar = browser.page.messageBar();
    //    messagebar.close();
    const myFavourites = browser.page.myFavourites();
    const favouriteName = 'A favourite that should show up in search results';
    myFavourites.saveHomeFavourite('Opastinsilta 6, Helsinki', favouriteName);
    const search = browser.page.searchFields();
    search.setOrigin(' ');
    search.verifyItemInSearchResult(favouriteName);
    browser.end();
  },
};
