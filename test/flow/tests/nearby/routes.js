module.exports = {
  tags: ['nearby', 'geolocation'],
  'I want to see nearby routes': browser => {
    browser.url(browser.launch_url);

    browser.page
      .nearby()
      .openNearbyRoutes()
      .waitForRoutes();

    browser.end();
  },
};
