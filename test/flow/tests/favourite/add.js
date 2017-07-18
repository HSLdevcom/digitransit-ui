module.exports = {
  tags: ['favourite'],
  'Add HSL address as favourite': browser => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();
    //    const messagebar = browser.page.messageBar();
    //    messagebar.close();
    const favouriteName = 'HSL';
    const myFavourites = browser.page.myFavourites();

    myFavourites.saveHomeFavourite('Opastinsilta 6, Helsinki', favouriteName);
    myFavourites.verifyFirstName(favouriteName);
    browser.end();
  },
};
