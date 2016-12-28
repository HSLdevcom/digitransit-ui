module.exports = {
  '@tags': ['smoke'],
  'Page should have title logo': (browser) => {
    browser.url(browser.launch_url);
    browser.waitForElementVisible('.navi-logo, .logo', browser.globals.elementVisibleTimeout);
    browser.end();
  },
};
