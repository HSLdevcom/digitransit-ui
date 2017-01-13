module.exports = {
  '@tags': ['history'],

  'Back button works on add favourite page': (browser) => {
    browser.url(browser.launch_url);

    const favourites = browser.page.myFavourites();
    favourites.clickFavourites();
    favourites.addFavourite();
    favourites.openFavouriteSearch(); // to modal

    browser.back(); // close modal
    browser.back(); // back from add fav
    favourites.addFavourite(); // add button again clickable

    browser.end();
  },

};
