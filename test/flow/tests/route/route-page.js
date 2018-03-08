module.exports = {
  '@tags': ['route', 'smoke'],
  'Route page shows stops with stop codes': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().setOrigin('6');
    browser.page.searchFields().enterKeyOrigin();

    browser.page.route().waitForStopCode();
    browser.end();
  },
};
