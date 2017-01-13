module.exports = {
  '@tags': ['history'],
  'Route page tab selection does not accumulate into history': (browser) => {
    browser.url(browser.launch_url);

    const nearby = browser.page.nearby();

    nearby.openNearbyRoutes().waitForRoutes();

    nearby.chooseRoute(1);
    nearby.clickSchedule();
    nearby.clickAlerts();

    browser.back();
    // all nearby routes again visible
    nearby.waitForRoutes();

    browser.end();
  },

};
