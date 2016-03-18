module.exports = {
  'title' : function (browser) {
    browser
      .url(browser.launch_url)
      .assert.title("Rutebanken");
  }

  'Simple itinerary search' : function(browser) {
    browser
      .url(browser.launch_url)
      .assert.title("Failure");
  }
};
