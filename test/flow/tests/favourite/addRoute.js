module.exports = {
  tags: ['favourite'],
  'Add route 615 as favourite': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().setSearch('615');

    const route = browser.page.route();
    route.addRouteAsFavourite();
    browser.back();

    const myFavourites = browser.page.myFavourites();
    myFavourites.clickFavourites();
    myFavourites.verifyFavouriteRoute(615);

    browser.end();
  },
};
