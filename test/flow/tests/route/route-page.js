module.exports = {
  '@tags': ['route', 'smoke'],
  'Route page shows stops with stop codes': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().selectOrigin('6');

    browser.page.route().waitForStopCode();
    browser.end();
  },

  'User should be able to click the home icon': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().selectOrigin('6');
    browser.page.route().waitForStopCode();

    const homeIcon = '.home-icon';
    browser.waitForElementVisible(
      homeIcon,
      browser.globals.elementVisibleTimeout,
    );
    browser.click(homeIcon);
    browser.end();
  },
};
