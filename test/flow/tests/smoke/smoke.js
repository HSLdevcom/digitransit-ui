module.exports = {
  '@tags': ['smoke'],
  'User should be able to use favourite tab': browser => {
    browser.url(browser.launch_url);

    const myFavourites = browser.page.myFavourites();
    myFavourites.clickFavourites();
    myFavourites.addFavourite();

    browser.end();
  },
};
