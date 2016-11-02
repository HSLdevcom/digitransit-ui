module.exports = {
  tags: ['about'],
  'Open about page': (browser) => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();
//    const messagebar = browser.page.messageBar();
//    messagebar.close();
    const menu = browser.page.mainMenu();
    menu.clickMenuToggle();
    menu.clickSelectEnglish();
    menu.openAbout();

    const aboutPage = browser.page.about();
    aboutPage.verifyPage();
    browser.end();
  },
};
