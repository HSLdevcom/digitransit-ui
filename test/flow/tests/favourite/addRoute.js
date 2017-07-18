module.exports = {
  tags: ['favourite'],
  'Add route 58 as favourite': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().setSearch('58');

    const route = browser.page.route();
    route.addRouteAsFavourite();
    browser.back();

    const myFavourites = browser.page.myFavourites();
    myFavourites.clickFavourites();
    myFavourites.verifyFavouriteRoute(58);

    browser.end();
  },
};
