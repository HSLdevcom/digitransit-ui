module.exports = {
  '@tags': ['route', 'smoke'],
  'Route page shows stops with stop codes': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().selectOrigin('6');

    browser.page.route().waitForStopCode();
    browser.end();
  },
};
