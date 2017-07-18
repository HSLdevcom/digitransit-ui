module.exports = {
  '@tags': ['route', 'smoke'],
  'Route page shows distance to nearest stop': browser => {
    browser.url(browser.launch_url);
    browser.setGeolocation(60.2, 24.95);
    browser.page.searchFields().setSearch('6');

    browser.page.route().waitForWalkDistance();
    browser.end();
  },
};
