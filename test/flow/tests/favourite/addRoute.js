module.exports = {
  '@disabled': true,
  tags: ['favourite'],
  'Add route 615 as favourite': browser => {
    browser.url(
      'http://127.0.0.1:8080/Opastinsilta%206,%20Helsinki::60.199437,24.940472/-',
    );

    browser.page.searchFields().selectFirstRouteSuggestion('615');

    const route = browser.page.route();
    route.addRouteAsFavourite();
    browser.back();

    const myFavourites = browser.page.myFavourites();
    myFavourites.clickFavourites();
    myFavourites.verifyFavouriteRoute(615);

    browser.end();
  },
};
