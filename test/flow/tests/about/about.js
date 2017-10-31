module.exports = {
  tags: ['about'],
  '@disabled': true, // XXX There's currently no link to about page

  'Open about page': browser => {
    browser.url(browser.launch_url);
    const menu = browser.page.mainMenu();
    menu.clickMenuToggle();
    menu.clickSelectEnglish();
    menu.openAbout();

    const aboutPage = browser.page.about();
    aboutPage.verifyPage();
    browser.end();
  },
};
