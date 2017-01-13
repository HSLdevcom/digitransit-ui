module.exports = {
  '@tags': ['history'],

  'Back button closes main search modal': (browser) => {
    browser.url(browser.launch_url);

    const searchFields = browser.page.searchFields();
    searchFields.openSearch();
    browser.back();
    searchFields.waitSearchClosing(); // back closes modal

    // make sure we are on the front page, and nearby is available
    browser.page.nearby()
      .openNearbyRoutes()
      .waitForRoutes();

    browser.end();
  },
};
