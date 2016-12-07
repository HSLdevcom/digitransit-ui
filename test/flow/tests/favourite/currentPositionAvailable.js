module.exports = {
  tags: ['favourite', 'search'],
  'Add favourite should offer current location': (browser) => {
    browser.url(browser.launch_url);

    const myFavourites = browser.page.myFavourites();
    myFavourites.clickFavourites();
    myFavourites.addFavourite();

    // regression test: use of current location as route search endpoint
    // must not exclude current position from favourite add tool
    // origin = current location by default
    myFavourites.verifyCurrentLocation();

    browser.end();
  },
};

