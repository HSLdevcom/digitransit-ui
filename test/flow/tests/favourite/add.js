module.exports = {
  tags: ['favourite'],
  'Add HSL address as favourite': browser => {
    browser.url(browser.launch_url);
    const favouriteName = 'HSL';
    const myFavourites = browser.page.myFavourites();

    myFavourites.saveHomeFavourite('Opastinsilta 6, Helsinki', favouriteName);
    myFavourites.verifyFirstName(favouriteName);
    browser.end();
  },
};
