module.exports = {
  '@tags': ['route', 'smoke'],
  'Route page shows distance to nearest stop': browser => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.2, 24.95);
    browser.page.searchFields().setOrigin('6');
    browser.page.searchFields().enterKeyOrigin();

    browser.page.route().waitForWalkDistance();
    browser.end();
  },
};
